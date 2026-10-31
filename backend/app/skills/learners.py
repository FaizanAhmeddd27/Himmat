"""Guest learner profiles: file-backed store and the Digital DNA read models."""

import json
import math
import threading
import time
from pathlib import Path
from typing import Dict, List, Optional

from pydantic import BaseModel, Field

from app.engine import loader
from app.engine import store as session_store
from app.engine.models import Languages, Scenario, SessionRecord, SkillChange
from app.skills.mastery import apply_events
from app.skills.taxonomy import BY_ID, SKILLS

# Where to practise a skill when it is the learner's weakest.
PRACTICE_FOR_SKILL = {"account_recovery": "recovery_shared_otp"}

REVIEW_DAYS = (1, 3, 7, 14)
DAY_SECONDS = 86400

LEARNER_NAME = "Amna"
SUPPORTER_NAME = "Bilal"

DEFAULT_CONSENTS = {
    "skills_summary": True,
    "difficulty_areas": True,
    "activity_timeline": False,
}


class HistoryPoint(BaseModel):
    label: str
    average: float


class ActivityItem(BaseModel):
    at: float
    text: Languages


class LearnerRecord(BaseModel):
    id: str
    scores: Dict[str, float] = Field(default_factory=dict)
    practised: List[str] = Field(default_factory=list)
    history: List[HistoryPoint] = Field(default_factory=list)
    activity: List[ActivityItem] = Field(default_factory=list)
    confidence: Dict[str, int] = Field(default_factory=dict)  # "before" / "after"
    consents: Dict[str, bool] = Field(default_factory=lambda: dict(DEFAULT_CONSENTS))
    completed_scenarios: List[str] = Field(default_factory=list)
    recovery_pending: Optional[str] = None
    mastery_passed: bool = False
    onboarded: bool = False
    assessed: bool = False
    # When each scenario was finished, for the review schedule (FR-6.8).
    scenario_log: Dict[str, List[float]] = Field(default_factory=dict)


def _average(scores: Dict[str, float]) -> float:
    return round(sum(scores.values()) / len(scores), 1) if scores else 0.0


def _new_learner(learner_id: str) -> LearnerRecord:
    scores = {skill.id: skill.start for skill in SKILLS}
    return LearnerRecord(
        id=learner_id,
        scores=scores,
        history=[HistoryPoint(label="Start", average=_average(scores))],
    )


class LearnerStore:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._path: Path = session_store.DATA_DIR / "learners.json"
        self._learners: Dict[str, LearnerRecord] = {}
        if self._path.exists():
            try:
                raw = json.loads(self._path.read_text(encoding="utf-8"))
                self._learners = {
                    key: LearnerRecord.model_validate(value)
                    for key, value in raw.items()
                }
            except (json.JSONDecodeError, OSError, ValueError):
                self._learners = {}

    def get(self, learner_id: str) -> LearnerRecord:
        with self._lock:
            if learner_id not in self._learners:
                self._learners[learner_id] = _new_learner(learner_id)
            return self._learners[learner_id]

    def save(self, learner: LearnerRecord) -> None:
        with self._lock:
            self._learners[learner.id] = learner
            self._write()

    def _write(self) -> None:
        session_store.write_json_atomic(
            self._path,
            {key: rec.model_dump(mode="json") for key, rec in self._learners.items()},
        )

    def reset(self, learner_id: str) -> LearnerRecord:
        learner = _new_learner(learner_id)
        self.save(learner)
        return learner

    def find(self, learner_id: str) -> Optional[LearnerRecord]:
        """Look up without creating, for links someone else opens."""
        with self._lock:
            return self._learners.get(learner_id)

    def delete(self, learner_id: str) -> None:
        with self._lock:
            self._learners.pop(learner_id, None)
            self._write()

    def mark_onboarded(self, learner_id: str) -> None:
        learner = self.get(learner_id)
        learner.onboarded = True
        self.save(learner)

    def set_confidence(self, learner_id: str, phase: str, rating: int) -> None:
        learner = self.get(learner_id)
        learner.confidence[phase] = rating
        self.save(learner)

    def apply_assessment(self, learner_id: str, scores: Dict[str, float]) -> None:
        """Real answers replace the sample starting point."""
        learner = self.get(learner_id)
        learner.scores.update(scores)
        learner.assessed = True
        learner.onboarded = True
        learner.history = [
            HistoryPoint(label="Start", average=_average(learner.scores))
        ]
        self.save(learner)


_learner_store: Optional[LearnerStore] = None


def get_learner_store() -> LearnerStore:
    global _learner_store
    if _learner_store is None:
        _learner_store = LearnerStore()
    return _learner_store


def _record_progress(learner: LearnerRecord, changes: List[SkillChange]) -> None:
    for change in changes:
        if change.skill not in learner.practised:
            learner.practised.append(change.skill)
    learner.history.append(
        HistoryPoint(
            label=f"Try {len(learner.history)}", average=_average(learner.scores)
        )
    )


def apply_session_result(scenario: Scenario, session: SessionRecord) -> None:
    """Update Digital DNA when a real try ends. What-if branches do not count:
    they are exploration, and rewinding should never feel like being graded."""
    if session.parent_session_id or session.outcome_id is None:
        return

    store = get_learner_store()
    learner = store.get(session.learner_id)
    changes = apply_events(
        learner.scores, session.events, unaided=session.mode == "mastery"
    )
    session.skill_changes = changes
    _record_progress(learner, changes)

    outcome = scenario.outcomes[session.outcome_id]
    if scenario.id not in learner.completed_scenarios:
        learner.completed_scenarios.append(scenario.id)
    learner.scenario_log.setdefault(scenario.id, []).append(time.time())
    if outcome.recovery:
        learner.recovery_pending = outcome.recovery
    if session.mode == "mastery" and outcome.tag == "safe":
        learner.mastery_passed = True

    # Family timeline: what was practised, never what went wrong (FR-8.4).
    learner.activity.append(
        ActivityItem(
            at=time.time(),
            text={
                "en": f"Practised: {scenario.title['en']}",
                "ur-Latn": f"Practice ki: {scenario.title.get('ur-Latn', scenario.title['en'])}",
            },
        )
    )
    store.save(learner)


def apply_recovery_result(
    learner_id: str, recovery_id: str, skill: str, passed: bool, completeness: int
) -> List[SkillChange]:
    store = get_learner_store()
    learner = store.get(learner_id)
    before = learner.scores[skill]
    value = 1.0 if passed else (completeness / 100) * 0.6
    learner.scores[skill] = before + 0.5 * (value * 100 - before)
    changes = [SkillChange(skill=skill, before=before, after=learner.scores[skill])]
    _record_progress(learner, changes)
    if passed and learner.recovery_pending == recovery_id:
        learner.recovery_pending = None
    learner.activity.append(
        ActivityItem(
            at=time.time(),
            text={
                "en": "Practised: what to do after sharing an OTP",
                "ur-Latn": "Practice ki: OTP dene ke baad kya karna hai",
            },
        )
    )
    store.save(learner)
    return changes


def recommendation(learner: LearnerRecord) -> dict:
    """Next best step, from what this learner has actually done (FR-6.4)."""
    if learner.recovery_pending:
        return {
            "kind": "recovery",
            "target": learner.recovery_pending,
            "skill": "account_recovery",
            "title": {
                "en": "What to do after sharing an OTP",
                "ur-Latn": "OTP dene ke baad kya karna hai",
            },
            "reason": {
                "en": "Knowing the first steps can save your money if this ever really happens.",
                "ur-Latn": "Agar sach mein aisa ho to pehle qadam jaanna aap ke paise bacha sakta hai.",
            },
        }
    if "fake_bank_message" not in learner.completed_scenarios:
        return {
            "kind": "scenario",
            "target": "fake_bank_message",
            "skill": "scam_detection",
            "title": {
                "en": "The Fake Bank Message",
                "ur-Latn": "Nakli Bank ka Message",
            },
            "reason": {
                "en": "Scam messages are the most common risk, and this skill has the most room to grow.",
                "ur-Latn": "Dhoke ke messages sab se aam khatra hain, aur is salahiyat mein sab se zyada gunjaish hai.",
            },
        }
    if not learner.mastery_passed:
        return {
            "kind": "mastery",
            "target": "lucky_draw_message",
            "skill": "scam_detection",
            "title": {
                "en": "The Lucky Draw Message",
                "ur-Latn": "Inami Qurandazi ka Message",
            },
            "reason": {
                "en": "A new situation with no hints shows what you can really do on your own.",
                "ur-Latn": "Baghair hint naya mauqa dikhata hai ke aap khud kya kar sakti hain.",
            },
        }
    weakest = min(
        (skill for skill in SKILLS if skill.has_content),
        key=lambda skill: learner.scores[skill.id],
    )
    return {
        "kind": "done",
        "target": PRACTICE_FOR_SKILL.get(weakest.id, "fake_bank_message"),
        "skill": weakest.id,
        "title": weakest.name,
        "reason": {
            "en": "This is your lowest skill right now. A little more practice will keep it fresh.",
            "ur-Latn": "Abhi yeh aap ki sab se kam salahiyat hai. Thori aur practice se yaad rahegi.",
        },
    }


def review_schedule(learner: LearnerRecord, now: Optional[float] = None) -> List[dict]:
    """Come back at growing intervals: 1, 3, 7, then 14 days (FR-6.8)."""
    current = time.time() if now is None else now
    reviews = []
    for scenario_id, finished in learner.scenario_log.items():
        interval = REVIEW_DAYS[min(len(finished), len(REVIEW_DAYS)) - 1]
        due_at = finished[-1] + interval * DAY_SECONDS
        scenario = loader.get_scenario(scenario_id)
        reviews.append(
            {
                "scenario_id": scenario_id,
                "kind": scenario.kind,
                "title": scenario.title,
                "due": current >= due_at,
                "days_left": max(0, math.ceil((due_at - current) / DAY_SECONDS)),
            }
        )
    return sorted(reviews, key=lambda review: review["days_left"])


def skill_views(learner: LearnerRecord) -> List[dict]:
    return [
        {
            "id": skill.id,
            "name": skill.name,
            "mastery": round(learner.scores[skill.id]),
            "practised": skill.id in learner.practised,
        }
        for skill in SKILLS
    ]


def dna_view(learner: LearnerRecord) -> dict:
    return {
        "learner_id": learner.id,
        "name": LEARNER_NAME,
        "skills": skill_views(learner),
        "history": [point.model_dump() for point in learner.history],
        "confidence": {
            "before": learner.confidence.get("before"),
            "after": learner.confidence.get("after"),
        },
        "recommendation": recommendation(learner),
        "assessed": learner.assessed,
        "onboarded": learner.onboarded,
        "reviews": review_schedule(learner),
    }


def family_view(learner: LearnerRecord) -> dict:
    """Only categories the learner has agreed to share leave this function."""
    consents = learner.consents
    skills = skill_views(learner)
    difficulty = [
        {"skill": view, "tip": BY_ID[view["id"]].tip}
        for view in sorted(skills, key=lambda view: view["mastery"])
        if view["mastery"] < 50 and BY_ID[view["id"]].has_content
    ][:3]
    return {
        "learner_name": LEARNER_NAME,
        "supporter_name": SUPPORTER_NAME,
        "consents": consents,
        "skills_summary": skills if consents.get("skills_summary") else None,
        "history": (
            [point.model_dump() for point in learner.history]
            if consents.get("skills_summary")
            else None
        ),
        "difficulty_areas": difficulty if consents.get("difficulty_areas") else None,
        "activity_timeline": (
            [
                {"label": f"Activity {index + 1}", "text": item.text}
                for index, item in enumerate(learner.activity[-5:])
            ]
            if consents.get("activity_timeline")
            else None
        ),
    }

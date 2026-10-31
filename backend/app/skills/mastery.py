"""Evidence to mastery (docs/ARCH.md §9.1). Pure functions, fully deterministic."""

from typing import Dict, Iterable, List

from app.engine.models import SessionEvent, SkillChange

BASE_ALPHA = 0.35
MASTERY_ALPHA = 0.5  # Unaided tests count for more: they show retained ability.

# Leaning on stronger hints lowers what a good choice proves (FR-6.2).
HINT_PENALTY = {0: 0.0, 1: 0.0, 2: 0.15, 3: 0.3}


def update_mastery(
    mastery: float, value: float, weight: float, hints_used: int, alpha: float
) -> float:
    effective = max(0.0, value - HINT_PENALTY.get(hints_used, 0.3))
    return mastery + (alpha * weight) * (effective * 100 - mastery)


def apply_events(
    scores: Dict[str, float], events: Iterable[SessionEvent], unaided: bool
) -> List[SkillChange]:
    """Update `scores` in place from a session's evidence; report what moved."""
    alpha = MASTERY_ALPHA if unaided else BASE_ALPHA
    before = dict(scores)
    for event in events:
        for evidence in event.evidence:
            if evidence.skill in scores:
                scores[evidence.skill] = update_mastery(
                    scores[evidence.skill],
                    evidence.value,
                    evidence.weight,
                    event.hints_used,
                    alpha,
                )
    return [
        SkillChange(skill=skill, before=before[skill], after=scores[skill])
        for skill in scores
        if round(scores[skill]) != round(before[skill])
    ]

"""Recovery Lab evaluator (docs/ARCH.md §8, SRS FR-5.x).

Deterministic: the learner's ordered list is checked against ranks in the
recovery JSON. Each step gets a verdict and a reason, never a bare score.
"""

from functools import lru_cache
from pathlib import Path
from typing import Dict, List, Optional

from pydantic import BaseModel

from app.engine.models import EngineError, Languages

RECOVERY_DIR = Path(__file__).resolve().parent.parent / "scenarios" / "recovery"


class RecoveryCard(BaseModel):
    id: str
    label: Languages
    explain: Languages
    # Position in the right sequence. Cards with no rank are not part of it.
    rank: Optional[int] = None
    critical: bool = False
    harmful: bool = False


class RecoveryScenario(BaseModel):
    id: str
    skill: str
    title: Languages
    intro: Languages
    cards: List[RecoveryCard]


@lru_cache(maxsize=1)
def _load_all() -> Dict[str, RecoveryScenario]:
    scenarios = {}
    for path in sorted(RECOVERY_DIR.glob("*.json")):
        scenario = RecoveryScenario.model_validate_json(
            path.read_text(encoding="utf-8")
        )
        scenarios[scenario.id] = scenario
    return scenarios


def get_recovery(recovery_id: str) -> RecoveryScenario:
    scenarios = _load_all()
    if recovery_id not in scenarios:
        raise EngineError(
            code="recovery_not_found",
            message="That recovery practice could not be found.",
            status=404,
        )
    return scenarios[recovery_id]


def public_view(scenario: RecoveryScenario) -> dict:
    """Cards without ranks or verdicts, so the order stays the learner's to work out."""
    return {
        "id": scenario.id,
        "title": scenario.title,
        "intro": scenario.intro,
        "cards": [{"id": c.id, "label": c.label} for c in scenario.cards],
    }


def evaluate(scenario: RecoveryScenario, submitted: List[str]) -> dict:
    """Score an ordered list of card ids for order and completeness."""
    cards = {card.id: card for card in scenario.cards}
    unknown = [card_id for card_id in submitted if card_id not in cards]
    if unknown or len(set(submitted)) != len(submitted):
        raise EngineError(
            code="invalid_steps",
            message="Each step can be chosen once. Please try again.",
            status=400,
        )

    steps = []
    highest_rank = 0
    for card_id in submitted:
        card = cards[card_id]
        if card.harmful:
            verdict = "harmful"
        elif card.rank is not None and card.rank < highest_rank:
            verdict = "order"
        else:
            verdict = "good"
        if card.rank is not None:
            highest_rank = max(highest_rank, card.rank)
        steps.append(
            {
                "id": card.id,
                "label": card.label,
                "verdict": verdict,
                "explain": card.explain,
            }
        )

    required = [card for card in scenario.cards if card.rank is not None]
    chosen = [card for card in required if card.id in submitted]
    missed = sorted(
        (card for card in required if card.id not in submitted),
        key=lambda card: card.rank or 0,
    )
    completeness = round(100 * len(chosen) / len(required)) if required else 100
    passed = not missed and all(step["verdict"] == "good" for step in steps)

    return {
        "passed": passed,
        "completeness": completeness,
        "steps": steps,
        "missed": [
            {"id": c.id, "label": c.label, "verdict": "order", "explain": c.explain}
            for c in missed
        ],
    }

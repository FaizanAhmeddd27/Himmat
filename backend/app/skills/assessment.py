"""First check (SRS FR-1.5): a few mini-situations that set real starting scores."""

from functools import lru_cache
from pathlib import Path
from typing import Dict, List

from pydantic import BaseModel

from app.engine.models import EngineError, Languages

ASSESSMENT_FILE = (
    Path(__file__).resolve().parent.parent
    / "scenarios"
    / "assessment"
    / "first_check.json"
)


class Option(BaseModel):
    id: str
    value: float
    label: Languages


class Question(BaseModel):
    id: str
    skill: str
    situation: Languages
    options: List[Option]


class Assessment(BaseModel):
    questions: List[Question]


@lru_cache(maxsize=1)
def load_assessment() -> Assessment:
    return Assessment.model_validate_json(ASSESSMENT_FILE.read_text(encoding="utf-8"))


def public_view() -> dict:
    """Questions and labels only, so the scoring stays on the server."""
    return {
        "questions": [
            {
                "id": question.id,
                "situation": question.situation,
                "options": [
                    {"id": option.id, "label": option.label}
                    for option in question.options
                ],
            }
            for question in load_assessment().questions
        ]
    }


def score(answers: Dict[str, str]) -> Dict[str, float]:
    """Turn {question id: option id} into starting scores per skill."""
    scores: Dict[str, float] = {}
    for question in load_assessment().questions:
        chosen = next(
            (o for o in question.options if o.id == answers.get(question.id)), None
        )
        if chosen is None:
            raise EngineError(
                code="assessment_incomplete",
                message="Please answer every question, or skip this step.",
                status=422,
            )
        scores[question.skill] = chosen.value
    return scores

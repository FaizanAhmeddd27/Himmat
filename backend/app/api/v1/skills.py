"""Digital DNA, Recovery Lab and family dashboard endpoints."""

from typing import List, Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.deps import learner_id
from app.engine import recovery as recovery_engine
from app.engine.models import EngineError
from app.skills import learners

router = APIRouter()


class ConfidenceRequest(BaseModel):
    scenario_id: str
    phase: Literal["before", "after"]
    rating: int = Field(ge=1, le=5)


class ConsentRequest(BaseModel):
    category: Literal["skills_summary", "difficulty_areas", "activity_timeline"]
    granted: bool


class RecoverySubmit(BaseModel):
    steps: List[str]


@router.get("/skills/dna", tags=["skills"])
async def get_dna(learner: str = Depends(learner_id)) -> dict:
    return learners.dna_view(learners.get_learner_store().get(learner))


@router.post("/skills/confidence", tags=["skills"])
async def rate_confidence(
    body: ConfidenceRequest, learner: str = Depends(learner_id)
) -> dict:
    store = learners.get_learner_store()
    record = store.get(learner)
    record.confidence[body.phase] = body.rating
    store.save(record)
    return {"ok": True}


@router.post("/skills/reset", tags=["skills"])
async def reset(learner: str = Depends(learner_id)) -> dict:
    learners.get_learner_store().reset(learner)
    return {"ok": True}


@router.get("/recovery/{recovery_id}", tags=["recovery"])
async def get_recovery(recovery_id: str) -> dict:
    try:
        return recovery_engine.public_view(recovery_engine.get_recovery(recovery_id))
    except EngineError as exc:
        raise HTTPException(
            status_code=exc.status, detail={"code": exc.code, "message": exc.message}
        )


@router.post("/recovery/{recovery_id}/submit", tags=["recovery"])
async def submit_recovery(
    recovery_id: str, body: RecoverySubmit, learner: str = Depends(learner_id)
) -> dict:
    try:
        scenario = recovery_engine.get_recovery(recovery_id)
        result = recovery_engine.evaluate(scenario, body.steps)
    except EngineError as exc:
        raise HTTPException(
            status_code=exc.status, detail={"code": exc.code, "message": exc.message}
        )
    changes = learners.apply_recovery_result(
        learner, recovery_id, scenario.skill, result["passed"], result["completeness"]
    )
    result["skill_changes"] = [change.model_dump() for change in changes]
    return result


@router.get("/family/dashboard", tags=["family"])
async def family_dashboard(learner: str = Depends(learner_id)) -> dict:
    return learners.family_view(learners.get_learner_store().get(learner))


@router.put("/family/consents", tags=["family"])
async def set_consent(body: ConsentRequest, learner: str = Depends(learner_id)) -> dict:
    """Takes effect immediately (FR-8.6): the next read is already filtered."""
    store = learners.get_learner_store()
    record = store.get(learner)
    record.consents[body.category] = body.granted
    store.save(record)
    return learners.family_view(record)

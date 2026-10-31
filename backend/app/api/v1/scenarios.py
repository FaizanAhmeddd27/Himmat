"""Scenario catalogue endpoints."""

from fastapi import APIRouter, HTTPException

from app.engine import loader
from app.engine.models import EngineError

router = APIRouter(tags=["scenarios"])


@router.get("/scenarios")
async def list_scenarios() -> list:
    return [
        {
            "id": s.id,
            "title": s.title,
            "summary": s.summary,
            "skills": s.skills,
            "difficulty": s.difficulty,
            "is_active": s.is_active,
            "nodes_count": len(s.nodes),
        }
        for s in loader.list_scenarios()
        if s.is_active
    ]


@router.get("/scenarios/{scenario_id}")
async def get_scenario(scenario_id: str) -> dict:
    try:
        scenario = loader.get_scenario(scenario_id)
    except EngineError as exc:
        raise HTTPException(
            status_code=exc.status, detail={"code": exc.code, "message": exc.message}
        )
    return {
        "id": scenario.id,
        "version": scenario.version,
        "title": scenario.title,
        "summary": scenario.summary,
        "skills": scenario.skills,
        "difficulty": scenario.difficulty,
    }

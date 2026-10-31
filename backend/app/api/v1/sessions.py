"""Session endpoints — start, view, act, hint.

Conventions (docs/ARCH §12): JSON, snake_case, structured errors.
"""

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.engine import service
from app.engine.models import EngineError, SessionMode

router = APIRouter(tags=["sessions"])


class CreateSessionRequest(BaseModel):
    scenario_id: str
    mode: SessionMode = "practice"


class ActionRequest(BaseModel):
    action_id: str
    # Text the learner typed (e.g. the practice OTP) when required by the action.
    input: Optional[str] = None
    # Idempotency guard hook for later (docs/ARCH §12): step the client thinks it is on.
    client_step_no: Optional[int] = None


def _http_error(exc: EngineError) -> HTTPException:
    return HTTPException(
        status_code=exc.status, detail={"code": exc.code, "message": exc.message}
    )


@router.post("/sessions", status_code=201)
async def create_session(body: CreateSessionRequest) -> dict:
    try:
        scenario, session = service.create_session(body.scenario_id, mode=body.mode)
    except EngineError as exc:
        raise _http_error(exc)
    return service.session_payload(scenario, session)


@router.get("/sessions/{session_id}")
async def get_session(session_id: str) -> dict:
    try:
        scenario, session = service.get_session(session_id)
    except EngineError as exc:
        raise _http_error(exc)
    return service.session_payload(scenario, session)


@router.post("/sessions/{session_id}/actions")
async def apply_action(session_id: str, body: ActionRequest) -> dict:
    try:
        _scenario, _session, outcome = service.perform_action(
            session_id, body.action_id, text_input=body.input
        )
    except EngineError as exc:
        raise _http_error(exc)
    return {
        "session_id": outcome.session_id,
        "node": outcome.next_node.model_dump(mode="json"),
        "state": outcome.state,
        "consequence": (
            outcome.consequence.model_dump() if outcome.consequence else None
        ),
        "outcome_id": outcome.outcome_id,
        "outcome_tag": outcome.outcome_tag,
        "headline": outcome.headline,
        "recovery": outcome.recovery,
        "status": outcome.status,
    }


@router.post("/sessions/{session_id}/hint")
async def request_hint(session_id: str, level: int = 1) -> dict:
    try:
        return service.use_hint(session_id, level)
    except EngineError as exc:
        raise _http_error(exc)

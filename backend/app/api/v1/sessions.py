"""Session endpoints: start, view, act, hint, replay, what-if.

Conventions (docs/ARCH §12): JSON, snake_case, structured errors.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.ai import mentor
from app.deps import learner_id
from app.engine import branching, replay, service
from app.engine.models import EngineError, SessionMode
from app.engine.store import get_store

router = APIRouter(tags=["sessions"])


class CreateSessionRequest(BaseModel):
    scenario_id: str
    mode: SessionMode = "practice"


class ActionRequest(BaseModel):
    action_id: str
    # Text the learner typed (e.g. the practice OTP) when required by the action.
    input: Optional[str] = None


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=500)
    lang: str = "en"


class BranchRequest(BaseModel):
    from_step: int
    action_id: str


def _http_error(exc: EngineError) -> HTTPException:
    return HTTPException(
        status_code=exc.status, detail={"code": exc.code, "message": exc.message}
    )


@router.post("/sessions", status_code=201)
async def create_session(
    body: CreateSessionRequest, learner: str = Depends(learner_id)
) -> dict:
    try:
        scenario, session = service.create_session(
            body.scenario_id, mode=body.mode, learner_id=learner
        )
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
        "status": outcome.status,
    }


@router.post("/sessions/{session_id}/hint")
async def request_hint(session_id: str, level: int = 1) -> dict:
    try:
        return service.use_hint(session_id, level)
    except EngineError as exc:
        raise _http_error(exc)


@router.post("/sessions/{session_id}/ask")
async def ask_mentor(session_id: str, body: AskRequest) -> dict:
    """Free-text question. Read-only: nothing here touches session state."""
    try:
        scenario, session = service.get_session(session_id)
    except EngineError as exc:
        raise _http_error(exc)
    node = scenario.nodes.get(session.current_node)
    if session.mode == "mastery" or node is None:
        raise _http_error(
            EngineError(
                code="hints_off",
                message="This one is for you to try on your own.",
                status=403,
            )
        )
    return {"text": await mentor.answer_question(node, body.question, body.lang)}


@router.get("/sessions/{session_id}/replay")
async def get_replay(session_id: str) -> dict:
    try:
        scenario, session = service.get_session(session_id)
    except EngineError as exc:
        raise _http_error(exc)
    return replay.build_replay(scenario, session)


@router.post("/sessions/{session_id}/branch", status_code=201)
async def create_branch(session_id: str, body: BranchRequest) -> dict:
    try:
        scenario, parent = service.get_session(session_id)
        branch = branching.create_branch(
            scenario, parent, body.from_step, body.action_id, get_store()
        )
    except EngineError as exc:
        raise _http_error(exc)
    return service.session_payload(scenario, branch)


@router.get("/sessions/{session_id}/compare/{branch_id}")
async def compare(session_id: str, branch_id: str) -> dict:
    try:
        scenario, parent = service.get_session(session_id)
        branch = get_store().get(branch_id)
        return branching.build_comparison(scenario, parent, branch)
    except EngineError as exc:
        raise _http_error(exc)

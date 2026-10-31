"""Session service — orchestration around the engine (docs/ARCH.md §5.2)."""

import time

from app.engine import loader
from app.engine.models import (
    SessionMode,
    ActionOutcome,
    EngineError,
    NodePayload,
    Scenario,
    SessionRecord,
)
from app.engine.state_machine import apply_action, render_node
from app.engine.store import get_store


def create_session(
    scenario_id: str, mode: SessionMode = "practice"
) -> tuple[Scenario, SessionRecord]:
    scenario = loader.get_scenario(scenario_id)
    session = get_store().create(
        scenario_id=scenario.id,
        current_node=scenario.initial_node,
        initial_state=dict(scenario.initial_state),
        mode=mode,
    )
    return scenario, session


def get_session(session_id: str) -> tuple[Scenario, SessionRecord]:
    session = get_store().get(session_id)
    scenario = loader.get_scenario(session.scenario_id)
    return scenario, session


def session_payload(scenario: Scenario, session: SessionRecord) -> dict:
    """Full view for GET /sessions/{id}."""
    node = scenario.nodes.get(session.current_node)
    if node is None:
        payload = NodePayload(
            id=session.current_node,
            type="outcome",
            ui=None,
            actions=[],
        )
    else:
        payload = render_node(scenario, node, session.current_node)

    outcome = scenario.outcomes.get(session.outcome_id) if session.outcome_id else None
    return {
        "session_id": session.id,
        "scenario_id": session.scenario_id,
        "mode": session.mode,
        "status": session.status,
        "node": payload.model_dump(mode="json"),
        "state": session.state,
        "outcome_id": session.outcome_id,
        "outcome_tag": outcome.tag if outcome else None,
        "headline": outcome.headline if outcome else None,
        "consequence": outcome.consequence.model_dump() if outcome else None,
        "recovery": outcome.recovery if outcome else None,
        "events_count": len(session.events),
        "hints_used": session.hints_used,
    }


def use_hint(session_id: str, level: int) -> dict:
    """Static 3-level hint from the scenario for the current node (Phase 5 adds AI)."""
    scenario, session = get_session(session_id)
    node = scenario.nodes.get(session.current_node)
    if node is None or node.hints is None:
        raise EngineError(
            code="no_hint",
            message="There is no hint for this screen.",
            status=404,
        )
    hint = {1: node.hints.l1, 2: node.hints.l2, 3: node.hints.l3}.get(level)
    if hint is None:
        raise EngineError(
            code="hint_level_invalid",
            message="Levels are 1, 2 or 3.",
            status=400,
        )
    # A higher hint level implies the lower ones were seen too.
    session.total_hints_used += max(0, level - session.hints_used)
    session.hints_used = max(session.hints_used, level)
    session.updated_at = time.time()
    get_store().update(session)
    return {"level": level, "hint": hint, "hints_used": session.hints_used}


def perform_action(
    session_id: str, action_id: str, text_input=None
) -> tuple[Scenario, SessionRecord, ActionOutcome]:
    scenario, session = get_session(session_id)
    if session.status == "completed":
        raise EngineError(
            code="session_completed",
            message="This scenario has finished. Start a new session to practise again.",
            status=409,
        )
    outcome = apply_action(scenario, session, action_id, text_input=text_input)
    get_store().update(session)
    return scenario, session, outcome

"""Deterministic state machine (docs/ARCH.md §6.2).

Same state + same action => same next node, same state, same consequence.
No randomness anywhere.
"""

import time
from typing import Optional

from app.engine.models import (
    ActionOutcome,
    EngineError,
    Node,
    NodePayload,
    Scenario,
    SessionEvent,
    SessionRecord,
    StateValue,
)


def render_node(scenario: Scenario, node: Node, node_id: str) -> NodePayload:
    """Public view of a node: what to render + which actions are offered."""
    return NodePayload(
        id=node_id,
        type=node.type,
        ui=node.ui,
        actions=node.actions,
    )


def apply_effects(state: dict, effects) -> dict:
    """Apply set/inc/append operations atomically on a deep copy of state."""
    new_state = dict(state)
    for key, value in effects.set.items():
        new_state[key] = value
    for key, amount in effects.inc.items():
        current = new_state.get(key, 0)
        current = float(current) if not isinstance(current, (int, float)) else current
        new_state[key] = current + amount
    for key, items in effects.append.items():
        new_state[key] = list(new_state.get(key) or []) + list(items)
    return new_state


def session_event(
    step_no: int,
    node_id: str,
    action_id: str,
    state_before: dict,
    state_after: dict,
    consequence_tag: Optional[str],
    hints_used: int,
) -> SessionEvent:
    return SessionEvent(
        step_no=step_no,
        node_id=node_id,
        action_id=action_id,
        state_before=state_before,
        state_after=state_after,
        consequence_tag=consequence_tag,
        hints_used=hints_used,
    )


def apply_action(
    scenario: Scenario,
    session: SessionRecord,
    action_id: str,
    text_input: Optional[str] = None,
    validate_input=None,
) -> ActionOutcome:
    """The one transition function of the engine. Raises EngineError.

    Args:
        scenario: loaded scenario graph.
        session: mutable session record (state, current_node updated in place).
        action_id: the chosen action on the current node.
        text_input: optional learner input (e.g. the practice OTP).
        validate_input: callable(text, kind) -> str (dependency-injected for tests).
    """
    node = scenario.nodes.get(session.current_node)
    if node is None:
        raise EngineError(
            code="node_not_found",
            message=f"Session is on unknown node '{session.current_node}'.",
            status=500,
        )

    action = next((a for a in node.actions if a.id == action_id), None)
    if action is None:
        raise EngineError(
            code="invalid_action",
            message=f"Action '{action_id}' is not available on node '{session.current_node}'.",
            status=400,
        )

    # Guards: every listed state value must equal the current state.
    for key, expected in action.guard.items():
        if session.state.get(key) != expected:
            raise EngineError(
                code="guard_failed",
                message=f"Action '{action_id}' is not allowed right now.",
                status=409,
            )

    # Input safety (SRS FR-2.5) — engine never stores real-looking data.
    if action.needs_input:
        if validate_input is None:
            from app.engine.validators import validate_practice_input as validate_input
        text_input = validate_input(text_input, action.needs_input)

    state_before = dict(session.state)
    session.state = apply_effects(session.state, action.effects)

    consequence = None
    outcome_def = None
    next_node_id = action.next

    if next_node_id in scenario.outcomes:
        # Outcome nodes live only in `outcomes` (docs/ARCH.md §6.6): terminal.
        outcome_def = scenario.outcomes[next_node_id]
        consequence = outcome_def.consequence
        session.status = "completed"
        session.outcome_id = next_node_id
        next_node = Node(
            type="outcome",
            ui=None,
            actions=[],
        )
    else:
        next_node = scenario.nodes.get(next_node_id)
        if next_node is None:
            raise EngineError(
                code="node_not_found",
                message=f"Action '{action.id}' targets unknown node '{action.next}'.",
                status=500,
            )

    session.current_node = next_node_id
    event = session_event(
        step_no=len(session.events) + 1,
        node_id=session.current_node,
        action_id=action.id,
        state_before=state_before,
        state_after=session.state,
        consequence_tag=outcome_def.tag if outcome_def else None,
        hints_used=session.hints_used,
    )
    session.events.append(event)
    session.updated_at = time.time()

    return ActionOutcome(
        session_id=session.id,
        next_node=render_node(scenario, next_node, next_node_id),
        state=session.state,
        consequence=consequence,
        outcome_id=session.outcome_id,
        outcome_tag=outcome_def.tag if outcome_def else None,
        recovery=outcome_def.recovery if outcome_def else None,
        status=session.status,
    )

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
    PublicAction,
    Scenario,
    SessionEvent,
    SessionRecord,
)
from app.engine.validators import validate_practice_input


def render_node(scenario: Scenario, node: Node, node_id: str) -> NodePayload:
    """Public view of a node: what to render + which actions are offered."""
    return NodePayload(
        id=node_id,
        type=node.type,
        ui=node.ui,
        actions=[
            PublicAction(
                id=action.id,
                label=action.label,
                slot=action.slot,
                needs_input=action.needs_input,
            )
            for action in node.actions
        ],
        has_hints=node.hints is not None,
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


def apply_action(
    scenario: Scenario,
    session: SessionRecord,
    action_id: str,
    text_input: Optional[str] = None,
) -> ActionOutcome:
    """The one transition function of the engine. Raises EngineError.

    Args:
        scenario: loaded scenario graph.
        session: mutable session record (state, current_node updated in place).
        action_id: the chosen action on the current node.
        text_input: optional learner input (e.g. the practice OTP).
    """
    from_node_id = session.current_node
    node = scenario.nodes.get(from_node_id)
    if node is None:
        raise EngineError(
            code="node_not_found",
            message=f"Session is on unknown node '{from_node_id}'.",
            status=500,
        )

    action = next((a for a in node.actions if a.id == action_id), None)
    if action is None:
        raise EngineError(
            code="invalid_action",
            message=f"Action '{action_id}' is not available on node '{from_node_id}'.",
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

    # Input safety (SRS FR-2.5): the engine never stores real-looking data.
    if action.needs_input:
        validate_practice_input(
            text_input, action.needs_input, expected=action.expected_input
        )

    state_before = dict(session.state)
    next_node_id = action.next
    outcome_def = scenario.outcomes.get(next_node_id)

    if outcome_def is not None:
        # Outcome nodes live only in `outcomes` (docs/ARCH.md §6.6): terminal.
        next_node = Node(type="outcome", ui=None, actions=[])
    elif next_node_id in scenario.nodes:
        next_node = scenario.nodes[next_node_id]
    else:
        raise EngineError(
            code="node_not_found",
            message=f"Action '{action.id}' targets unknown node '{action.next}'.",
            status=500,
        )

    session.state = apply_effects(session.state, action.effects)
    session.current_node = next_node_id
    if outcome_def is not None:
        session.status = "completed"
        session.outcome_id = next_node_id

    session.events.append(
        SessionEvent(
            step_no=len(session.events) + 1,
            node_id=from_node_id,
            to_node=next_node_id,
            action_id=action.id,
            state_before=state_before,
            state_after=dict(session.state),
            consequence_tag=outcome_def.tag if outcome_def else None,
            hints_used=session.hints_used,
            evidence=list(action.evidence),
        )
    )
    # Hints belong to one screen: the next screen starts fresh.
    session.hints_used = 0
    session.updated_at = time.time()

    return ActionOutcome(
        session_id=session.id,
        next_node=render_node(scenario, next_node, next_node_id),
        state=session.state,
        consequence=outcome_def.consequence if outcome_def else None,
        outcome_id=session.outcome_id,
        outcome_tag=outcome_def.tag if outcome_def else None,
        headline=outcome_def.headline if outcome_def else None,
        recovery=outcome_def.recovery if outcome_def else None,
        status=session.status,
    )

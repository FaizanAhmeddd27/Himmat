"""Mistake Replay: turn a session's events into a plain-language timeline.

Everything here reads scenario data and the immutable event log, so a replay is
fully traceable to the rules that produced it (SRS NFR-X1).
"""

from typing import List, Optional

from app.engine.models import Action, Scenario, SessionEvent, SessionRecord


def _action_of(scenario: Scenario, event: SessionEvent) -> Optional[Action]:
    node = scenario.nodes.get(event.node_id)
    if node is None:
        return None
    return next((a for a in node.actions if a.id == event.action_id), None)


def build_steps(scenario: Scenario, session: SessionRecord) -> List[dict]:
    """One entry per learner choice, tagged safe/risky/neutral (FR-4.1, FR-4.2)."""
    steps: List[dict] = []
    for event in session.events:
        action = _action_of(scenario, event)
        if action is None:
            continue
        node = scenario.nodes[event.node_id]
        steps.append(
            {
                "step_no": event.step_no,
                "text": action.replay,
                "reason": action.reason,
                "tag": action.tag,
                # Other choices that were on offer: these power "What if?".
                "alternatives": [
                    {"action_id": other.id, "what_if": other.what_if}
                    for other in node.actions
                    if other.id != action.id and other.what_if
                ],
            }
        )
    return steps


def build_outcome(scenario: Scenario, session: SessionRecord) -> Optional[dict]:
    if session.outcome_id is None:
        return None
    outcome = scenario.outcomes[session.outcome_id]
    balance = session.state.get("practice_balance")
    return {
        "id": session.outcome_id,
        "tag": outcome.tag,
        "headline": outcome.headline,
        "recovery": outcome.recovery,
        "practice_balance": balance if isinstance(balance, (int, float)) else None,
    }


def build_replay(scenario: Scenario, session: SessionRecord) -> dict:
    return {
        "session_id": session.id,
        "scenario_id": scenario.id,
        "scenario_title": scenario.title,
        "start": scenario.replay_start,
        "steps": build_steps(scenario, session),
        "outcome": build_outcome(scenario, session),
        "parent_session_id": session.parent_session_id,
        "branch_from_step": session.branch_from_step,
    }

"""What-if engine (docs/ARCH.md §7.3): rewind to a decision and choose again.

A branch is a new session rebuilt from the parent's event log. The parent is
never modified (SRS FR-4.5), and the chosen action goes through the normal
engine path, so a branch obeys exactly the same rules as a first run.
"""

from app.engine.models import EngineError, Scenario, SessionRecord
from app.engine.replay import build_outcome, build_steps
from app.engine.state_machine import apply_action
from app.engine.store import SessionStore


def create_branch(
    scenario: Scenario,
    parent: SessionRecord,
    from_step: int,
    action_id: str,
    store: SessionStore,
) -> SessionRecord:
    if not 1 <= from_step <= len(parent.events):
        raise EngineError(
            code="invalid_step",
            message="That step is not part of this try.",
            status=400,
        )

    event = parent.events[from_step - 1]
    if action_id == event.action_id:
        raise EngineError(
            code="same_choice",
            message="That is the choice you already made. Pick a different one.",
            status=400,
        )

    node = scenario.nodes[event.node_id]
    action = next((a for a in node.actions if a.id == action_id), None)
    if action is None:
        raise EngineError(
            code="invalid_action",
            message="That choice was not available on this screen.",
            status=400,
        )

    branch = store.create(
        scenario_id=parent.scenario_id,
        current_node=event.node_id,
        initial_state=dict(event.state_before),
        mode=parent.mode,
        learner_id=parent.learner_id,
    )
    branch.parent_session_id = parent.id
    branch.branch_from_step = from_step
    branch.events = [e.model_copy(deep=True) for e in parent.events[: from_step - 1]]

    # A rewind should never ask the learner to type a code again.
    apply_action(scenario, branch, action_id, text_input=action.expected_input)
    return store.update(branch)


def build_comparison(
    scenario: Scenario, parent: SessionRecord, branch: SessionRecord
) -> dict:
    if branch.parent_session_id != parent.id:
        raise EngineError(
            code="not_a_branch",
            message="These two tries are not related.",
            status=400,
        )
    return {
        "scenario_title": scenario.title,
        "start": scenario.replay_start,
        "shared_steps": (branch.branch_from_step or 1) - 1,
        "original": {
            "session_id": parent.id,
            "steps": build_steps(scenario, parent),
            "outcome": build_outcome(scenario, parent),
        },
        "branch": {
            "session_id": branch.id,
            "steps": build_steps(scenario, branch),
            "outcome": build_outcome(scenario, branch),
        },
    }

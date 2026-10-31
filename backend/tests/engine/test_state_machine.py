"""Deterministic state machine tests (docs/DEV_PLAN.md Phase 2 done-when).

Rule under test: same state + same action => same result. No randomness.
"""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from app.engine import loader
from app.engine.models import EngineError, SessionRecord
from app.engine.state_machine import apply_action

SCENARIO_ID = "fake_bank_message"


def make_session(scenario, node=None) -> SessionRecord:
    return SessionRecord(
        id="test-session",
        scenario_id=SCENARIO_ID,
        current_node=node or scenario.initial_node,
        state=dict(scenario.initial_state),
        started_at=0.0,
        updated_at=0.0,
    )


@pytest.fixture(scope="module")
def scenario():
    return loader.get_scenario(SCENARIO_ID)


# ---- same choices => same result ------------------------------------------


def run_script(scenario, steps):
    """Apply a script of (action_id, input) tuples; return (outcome, session)."""
    session = make_session(scenario)
    outcome = None
    for action_id, text_input in steps:
        outcome = apply_action(scenario, session, action_id, text_input=text_input)
    return outcome, session


def test_determinism_same_script_same_result(scenario):
    steps = [("open_link", None), ("close_page", None)]
    first_outcome, first_session = run_script(scenario, steps)
    second_outcome, second_session = run_script(scenario, steps)

    assert first_session.status == second_session.status
    assert first_session.state == second_session.state
    assert first_session.current_node == second_session.current_node
    assert first_session.outcome_id == second_session.outcome_id
    assert first_session.events[0].state_after == second_session.events[0].state_after
    assert first_outcome.outcome_tag == second_outcome.outcome_tag


def test_determinism_event_log_fully_replays(scenario):
    steps = [("check_sender", None), ("report_block", None)]
    _outcome, session = run_script(scenario, steps)
    _outcome2, session2 = run_script(scenario, steps)

    assert [e.action_id for e in session.events] == [
        e.action_id for e in session2.events
    ]
    assert [e.state_after for e in session.events] == [
        e.state_after for e in session2.events
    ]


# ---- safe ending -----------------------------------------------------------


def test_safe_ending_reachable(scenario):
    outcome, session = run_script(
        scenario, [("check_sender", None), ("report_block", None)]
    )

    assert session.status == "completed"
    assert session.outcome_id == "n_safe"
    assert outcome.outcome_tag == "safe"
    assert outcome.consequence is not None
    assert outcome.consequence.what["en"]
    assert outcome.consequence.why["ur-Latn"]
    # safe outcome leaves nothing risky in state
    assert not session.state.get("opened_link")
    assert not session.state.get("shared_otp")


# ---- compromised ending ----------------------------------------------------


def test_compromised_ending_reachable_with_practice_otp(scenario):
    outcome, session = run_script(
        scenario,
        [
            ("open_link", None),
            ("enter_otp", "246810"),  # 6-digit practice code must be accepted
        ],
    )

    assert session.status == "completed"
    assert session.outcome_id == "n_compromised"
    assert outcome.outcome_tag == "affected"
    assert session.state["shared_otp"] is True
    assert outcome.recovery == "recovery_shared_otp"
    assert outcome.consequence.do_differently["en"]


# ---- close-call ending ------------------------------------------------------


def test_close_call_ending_reachable(scenario):
    outcome, session = run_script(scenario, [("open_link", None), ("close_page", None)])

    assert session.status == "completed"
    assert session.outcome_id == "n_close_call"
    assert outcome.outcome_tag == "close_call"
    assert not session.state.get("shared_otp")


# ---- helped path ------------------------------------------------------------


def test_helped_outcome_neutral(scenario):
    outcome, session = run_script(scenario, [("call_son", None)])

    assert session.status == "completed"
    assert session.outcome_id == "n_helped"
    assert outcome.outcome_tag == "neutral"


# ---- invalid actions and back-navigation ------------------------------------


def test_invalid_action_rejected(scenario):
    session = make_session(scenario)
    with pytest.raises(EngineError) as exc:
        apply_action(scenario, session, "report_block")  # not available on n_msg
    assert exc.value.code == "invalid_action"
    assert exc.value.status == 400


def test_go_back_returns_to_message_node(scenario):
    _outcome, session = run_script(
        scenario, [("check_sender", None), ("go_back", None)]
    )

    assert session.status == "active"
    assert session.current_node == "n_msg"
    assert len(session.events) == 2


def test_completed_session_state_recorded(scenario):
    _outcome, session = run_script(
        scenario, [("check_sender", None), ("report_block", None)]
    )
    # 2 events, each recording state before/after
    assert [e.action_id for e in session.events] == ["check_sender", "report_block"]
    assert session.events[0].state_after.get("checked_sender") is True
    assert session.events[1].state_after.get("reported") is True

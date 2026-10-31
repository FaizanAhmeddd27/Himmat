"""Mistake Replay + What-if (SRS FR-4.x, AC-4): rewinding never rewrites history."""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from app.engine import branching, loader, replay
from app.engine.models import EngineError, SessionRecord
from app.engine.state_machine import apply_action
from app.engine.store import SessionStore

MISTAKE = [("open_link", None), ("enter_otp", "246810"), ("see_what_happened", None)]


@pytest.fixture(scope="module")
def scenario():
    return loader.get_scenario("fake_bank_message")


@pytest.fixture
def store(tmp_path, monkeypatch):
    monkeypatch.setattr("app.engine.store.SESSIONS_FILE", tmp_path / "sessions.json")
    return SessionStore()


@pytest.fixture
def played(scenario, store) -> SessionRecord:
    session = store.create(
        scenario.id, scenario.initial_node, dict(scenario.initial_state)
    )
    for action_id, text in MISTAKE:
        apply_action(scenario, session, action_id, text_input=text)
    return store.update(session)


def test_replay_lists_every_step_with_tag_and_reason(scenario, played):
    view = replay.build_replay(scenario, played)
    assert [s["tag"] for s in view["steps"]] == ["risky", "risky", "neutral"]
    assert all(s["text"]["en"] and s["reason"]["en"] for s in view["steps"])
    assert view["start"]["en"]
    assert view["outcome"]["tag"] == "affected"
    assert view["outcome"]["practice_balance"] == 1500


def test_replay_offers_the_other_choices_at_a_decision(scenario, played):
    first = replay.build_replay(scenario, played)["steps"][0]
    assert {a["action_id"] for a in first["alternatives"]} == {
        "check_sender",
        "call_son",
    }


def test_step_with_no_other_choice_offers_no_what_if(scenario, played):
    assert replay.build_replay(scenario, played)["steps"][2]["alternatives"] == []


def test_branch_rewinds_to_the_decision_screen(scenario, played, store):
    branch = branching.create_branch(scenario, played, 1, "check_sender", store)
    assert branch.current_node == "n_sender"
    assert branch.parent_session_id == played.id
    assert branch.branch_from_step == 1
    assert branch.state["opened_link"] is False
    assert branch.state["practice_balance"] == 50000


def test_branch_leaves_the_original_untouched(scenario, played, store):
    before = played.model_dump()
    branch = branching.create_branch(scenario, played, 1, "check_sender", store)
    apply_action(scenario, branch, "report_block")
    assert played.model_dump() == before


def test_branch_from_a_later_step_keeps_the_shared_history(scenario, played, store):
    branch = branching.create_branch(scenario, played, 2, "close_page", store)
    assert [e.action_id for e in branch.events] == ["open_link", "close_page"]
    assert branch.status == "completed"
    assert branch.outcome_id == "n_close_call"


def test_branch_is_deterministic(scenario, played, store):
    one = branching.create_branch(scenario, played, 1, "call_son", store)
    two = branching.create_branch(scenario, played, 1, "call_son", store)
    assert one.state == two.state
    assert one.outcome_id == two.outcome_id


def test_what_if_into_the_otp_needs_no_typing(scenario, store):
    session = store.create(
        scenario.id, scenario.initial_node, dict(scenario.initial_state)
    )
    apply_action(scenario, session, "open_link")
    apply_action(scenario, session, "close_page")
    branch = branching.create_branch(scenario, session, 2, "enter_otp", store)
    assert branch.current_node == "n_debit"


@pytest.mark.parametrize(
    "step,action,code",
    [
        (1, "open_link", "same_choice"),
        (1, "report_block", "invalid_action"),
        (9, "check_sender", "invalid_step"),
    ],
)
def test_bad_branch_requests_are_refused(scenario, played, store, step, action, code):
    with pytest.raises(EngineError) as exc:
        branching.create_branch(scenario, played, step, action, store)
    assert exc.value.code == code


def test_comparison_shows_both_outcomes(scenario, played, store):
    branch = branching.create_branch(scenario, played, 1, "check_sender", store)
    apply_action(scenario, branch, "report_block")
    view = branching.build_comparison(scenario, played, branch)
    assert view["shared_steps"] == 0
    assert view["original"]["outcome"]["tag"] == "affected"
    assert view["branch"]["outcome"]["tag"] == "safe"
    assert view["original"]["outcome"]["practice_balance"] == 1500
    assert view["branch"]["outcome"]["practice_balance"] == 50000


def test_unrelated_sessions_cannot_be_compared(scenario, played, store):
    other = store.create(
        scenario.id, scenario.initial_node, dict(scenario.initial_state)
    )
    with pytest.raises(EngineError) as exc:
        branching.build_comparison(scenario, played, other)
    assert exc.value.code == "not_a_branch"

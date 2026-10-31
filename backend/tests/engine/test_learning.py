"""Recovery Lab, Digital DNA, mastery and family consent (AC-5, AC-6, AC-10)."""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from app.engine import loader, recovery, store as store_module
from app.engine.models import SessionRecord
from app.engine.state_machine import apply_action
from app.skills import learners
from app.skills.mastery import update_mastery

RIGHT_ORDER = ["stop", "call_bank", "block_card", "change_passwords", "report"]


@pytest.fixture(autouse=True)
def fresh_learners(tmp_path, monkeypatch):
    monkeypatch.setattr(store_module, "DATA_DIR", tmp_path)
    monkeypatch.setattr(learners, "_learner_store", None)


def played(scenario_id, script, mode="practice") -> tuple:
    scenario = loader.get_scenario(scenario_id)
    session = SessionRecord(
        id="s1",
        scenario_id=scenario_id,
        mode=mode,
        learner_id="amna",
        current_node=scenario.initial_node,
        state=dict(scenario.initial_state),
        started_at=0.0,
        updated_at=0.0,
    )
    for action_id, text in script:
        apply_action(scenario, session, action_id, text_input=text)
    return scenario, session


MISTAKE = [("open_link", None), ("enter_otp", "246810"), ("see_what_happened", None)]
SAFE = [("check_sender", None), ("report_block", None)]
MASTERY_PASS = [("check_sender", None), ("report_block", None)]


# ---- Recovery Lab -------------------------------------------------------------


@pytest.fixture
def otp_recovery():
    return recovery.get_recovery("recovery_shared_otp")


def test_right_order_passes(otp_recovery):
    result = recovery.evaluate(otp_recovery, RIGHT_ORDER)
    assert result["passed"] is True
    assert result["completeness"] == 100
    assert {step["verdict"] for step in result["steps"]} == {"good"}


def test_wrong_order_is_flagged_and_explained(otp_recovery):
    result = recovery.evaluate(
        otp_recovery, ["stop", "report", "call_bank", "block_card", "change_passwords"]
    )
    assert result["passed"] is False
    flagged = [step for step in result["steps"] if step["verdict"] == "order"]
    # Only the step that jumped ahead is flagged, not the ones it pushed back.
    assert [step["id"] for step in flagged] == ["report"]
    assert flagged[0]["explain"]["en"]


def test_harmful_step_fails_even_when_complete(otp_recovery):
    result = recovery.evaluate(otp_recovery, ["reply_scammer", *RIGHT_ORDER])
    assert result["passed"] is False
    assert result["steps"][0]["verdict"] == "harmful"


def test_missed_steps_are_listed(otp_recovery):
    result = recovery.evaluate(otp_recovery, ["stop", "call_bank"])
    assert result["completeness"] == 40
    assert {step["verdict"] for step in result["missed"]} == {"missed"}
    assert [step["id"] for step in result["missed"]] == [
        "block_card",
        "change_passwords",
        "report",
    ]


def test_public_view_hides_the_answer(otp_recovery):
    for card in recovery.public_view(otp_recovery)["cards"]:
        assert set(card) == {"id", "label"}


# ---- Digital DNA --------------------------------------------------------------


def test_mistake_lowers_and_good_choice_raises_mastery():
    assert update_mastery(50, 0.0, 1.0, 0, 0.35) < 50
    assert update_mastery(50, 1.0, 1.0, 0, 0.35) > 50


def test_strong_hints_lower_what_a_good_choice_proves():
    unaided = update_mastery(30, 1.0, 1.0, 0, 0.35)
    aided = update_mastery(30, 1.0, 1.0, 3, 0.35)
    assert aided < unaided


def test_session_updates_dna_and_reports_changes():
    scenario, session = played("fake_bank_message", MISTAKE)
    learners.apply_session_result(scenario, session)
    learner = learners.get_learner_store().get("amna")
    assert learner.scores["scam_detection"] < 30
    assert {change.skill for change in session.skill_changes} >= {"scam_detection"}
    assert len(learner.history) == 2


def test_what_if_branches_do_not_touch_dna():
    scenario, session = played("fake_bank_message", SAFE)
    session.parent_session_id = "parent"
    learners.apply_session_result(scenario, session)
    assert learners.get_learner_store().get("amna").scores["scam_detection"] == 30


def test_recommendations_follow_the_learner_journey():
    store = learners.get_learner_store()
    assert learners.recommendation(store.get("amna"))["target"] == "fake_bank_message"

    scenario, session = played("fake_bank_message", MISTAKE)
    learners.apply_session_result(scenario, session)
    assert learners.recommendation(store.get("amna"))["kind"] == "recovery"

    learners.apply_recovery_result(
        "amna", "recovery_shared_otp", "account_recovery", True, 100
    )
    assert learners.recommendation(store.get("amna"))["kind"] == "mastery"

    scenario, session = played("lucky_draw_message", MASTERY_PASS, mode="mastery")
    learners.apply_session_result(scenario, session)
    assert store.get("amna").mastery_passed is True
    assert learners.recommendation(store.get("amna"))["kind"] == "done"


def test_recommendation_never_points_at_unbuilt_content():
    store = learners.get_learner_store()
    learner = store.get("amna")
    learner.completed_scenarios = ["fake_bank_message"]
    learner.mastery_passed = True
    assert learners.recommendation(learner)["skill"] not in {
        "online_payments",
        "video_calls",
    }


def test_weakest_skill_recommendation_opens_the_matching_practice():
    learner = learners.get_learner_store().get("amna")
    learner.completed_scenarios = ["fake_bank_message"]
    learner.mastery_passed = True
    learner.scores.update(
        {
            "scam_detection": 80,
            "otp_safety": 80,
            "reporting": 80,
            "account_recovery": 10,
        }
    )
    rec = learners.recommendation(learner)
    assert rec["skill"] == "account_recovery"
    assert rec["target"] == "recovery_shared_otp"


def test_mastery_counts_for_more_than_practice():
    scenario, practice = played("lucky_draw_message", MASTERY_PASS)
    learners.apply_session_result(scenario, practice)
    after_practice = learners.get_learner_store().get("amna").scores["scam_detection"]

    learners.get_learner_store().reset("amna")
    scenario, mastery = played("lucky_draw_message", MASTERY_PASS, mode="mastery")
    learners.apply_session_result(scenario, mastery)
    after_mastery = learners.get_learner_store().get("amna").scores["scam_detection"]
    assert after_mastery > after_practice


# ---- Family consent -----------------------------------------------------------


def test_family_view_shows_only_consented_categories():
    learner = learners.get_learner_store().get("amna")
    view = learners.family_view(learner)
    assert view["skills_summary"] and view["difficulty_areas"]
    assert view["activity_timeline"] is None

    learner.consents["skills_summary"] = False
    view = learners.family_view(learner)
    assert view["skills_summary"] is None
    assert view["history"] is None


def test_family_timeline_never_reveals_mistakes():
    scenario, session = played("fake_bank_message", MISTAKE)
    learners.apply_session_result(scenario, session)
    learner = learners.get_learner_store().get("amna")
    learner.consents["activity_timeline"] = True
    text = str(learners.family_view(learner)["activity_timeline"]).lower()
    assert "otp" not in text
    assert "48,500" not in text
    assert "fake bank message" in text

"""Demo learner for judges. Progress is earned by playing the real engine with
scripted choices, so every number on the dashboard comes from the normal rules."""

from app.engine import recovery, service
from app.skills import learners

MISTAKE = [("open_link", None), ("enter_otp", "246810"), ("see_what_happened", None)]
RECOVERY_STEPS = ["stop", "call_bank", "block_card", "change_passwords", "report"]
MASTERY = [("check_sender", None), ("report_block", None)]


def _play(
    learner_id: str, scenario_id: str, script: list, mode: str = "practice"
) -> None:
    _scenario, session = service.create_session(
        scenario_id, mode=mode, learner_id=learner_id  # type: ignore[arg-type]
    )
    for action_id, text in script:
        service.perform_action(session.id, action_id, text_input=text)


def seed_demo_learner(learner_id: str) -> None:
    store = learners.get_learner_store()
    store.reset(learner_id)
    store.mark_onboarded(learner_id)
    store.set_confidence(learner_id, "before", 1)

    _play(learner_id, "fake_bank_message", MISTAKE)

    scenario = recovery.get_recovery("recovery_shared_otp")
    result = recovery.evaluate(scenario, RECOVERY_STEPS)
    learners.apply_recovery_result(
        learner_id,
        scenario.id,
        scenario.skill,
        result["passed"],
        result["completeness"],
    )

    _play(learner_id, "lucky_draw_message", MASTERY, mode="mastery")
    store.set_confidence(learner_id, "after", 4)

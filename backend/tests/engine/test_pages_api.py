"""API behind onboarding, dashboard, settings, supporter view and demo (FR-1.x, 8.x)."""

import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from app.engine import store as store_module
from app.main import app
from app.skills import assessment, learners

HEADERS = {"X-Learner-Id": "amna-test"}
ALL_BEST = {
    "q_scam": "a",
    "q_otp": "a",
    "q_report": "a",
    "q_recovery": "a",
    "q_payments": "a",
    "q_video": "a",
}


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(store_module, "DATA_DIR", tmp_path)
    monkeypatch.setattr(store_module, "SESSIONS_FILE", tmp_path / "sessions.json")
    monkeypatch.setattr(store_module, "_store", None)
    monkeypatch.setattr(learners, "_learner_store", None)
    return TestClient(app)


def test_assessment_view_hides_scoring(client):
    view = client.get("/api/v1/assessment").json()
    assert len(view["questions"]) == 6
    for question in view["questions"]:
        assert "skill" not in question
        assert all(set(o) == {"id", "label"} for o in question["options"])


def test_assessment_questions_are_translated_and_cover_all_skills():
    questions = assessment.load_assessment().questions
    assert {q.skill for q in questions} == set(learners.BY_ID)
    for question in questions:
        assert question.situation["ur-Latn"]
        assert all(option.label["ur-Latn"] for option in question.options)


def test_answers_replace_the_sample_scores(client):
    dna = client.post(
        "/api/v1/assessment/submit", json={"answers": ALL_BEST}, headers=HEADERS
    ).json()
    assert dna["assessed"] is True and dna["onboarded"] is True
    assert next(s for s in dna["skills"] if s["id"] == "otp_safety")["mastery"] == 85
    assert len(dna["history"]) == 1


def test_unfinished_assessment_is_refused(client):
    response = client.post(
        "/api/v1/assessment/submit", json={"answers": {"q_scam": "a"}}, headers=HEADERS
    )
    assert response.status_code == 422


def test_skip_marks_onboarded_and_keeps_sample_scores(client):
    client.post("/api/v1/assessment/skip", headers=HEADERS)
    dna = client.get("/api/v1/skills/dna", headers=HEADERS).json()
    assert dna["onboarded"] is True and dna["assessed"] is False


def test_demo_seed_runs_the_real_engine(client):
    assert client.post("/api/v1/demo/seed", headers=HEADERS).status_code == 200
    dna = client.get("/api/v1/skills/dna", headers=HEADERS).json()
    assert len(dna["history"]) == 4
    assert dna["confidence"] == {"before": 1, "after": 4}
    assert {r["scenario_id"] for r in dna["reviews"]} == {
        "fake_bank_message",
        "lucky_draw_message",
    }
    assert dna["recommendation"]["kind"] == "done"


def test_reviews_grow_with_each_completion_and_come_due():
    learner = learners.LearnerRecord(id="x")
    learner.scenario_log = {"fake_bank_message": [1000.0]}
    review = learners.review_schedule(learner, now=1000.0)[0]
    assert review["due"] is False and review["days_left"] == 1

    learner.scenario_log["fake_bank_message"].append(1000.0)
    assert learners.review_schedule(learner, now=1000.0)[0]["days_left"] == 3

    later = 1000.0 + 4 * learners.DAY_SECONDS
    assert learners.review_schedule(learner, now=later)[0]["due"] is True


def test_supporter_link_is_consent_filtered(client):
    client.get("/api/v1/skills/dna", headers=HEADERS)
    url = "/api/v1/family/dashboard/amna-test"
    assert client.get(url).json()["activity_timeline"] is None

    client.put(
        "/api/v1/family/consents",
        json={"category": "skills_summary", "granted": False},
        headers=HEADERS,
    )
    view = client.get(url).json()
    assert view["skills_summary"] is None and view["history"] is None


def test_supporter_link_never_creates_a_profile(client):
    assert client.get("/api/v1/family/dashboard/nobody").status_code == 404
    assert learners.get_learner_store().find("nobody") is None


def test_delete_removes_profile_and_sessions(client):
    created = client.post(
        "/api/v1/sessions", json={"scenario_id": "fake_bank_message"}, headers=HEADERS
    ).json()
    client.get("/api/v1/skills/dna", headers=HEADERS)

    assert client.delete("/api/v1/account", headers=HEADERS).status_code == 200

    assert learners.get_learner_store().find("amna-test") is None
    assert client.get(f"/api/v1/sessions/{created['session_id']}").status_code == 404


def test_delete_leaves_other_learners_alone(client):
    other = {"X-Learner-Id": "someone-else"}
    created = client.post(
        "/api/v1/sessions", json={"scenario_id": "fake_bank_message"}, headers=other
    ).json()
    client.delete("/api/v1/account", headers=HEADERS)
    assert client.get(f"/api/v1/sessions/{created['session_id']}").status_code == 200

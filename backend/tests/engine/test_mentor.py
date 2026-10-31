"""AI layer (SRS FR-7.x, AC-8): hints survive AI failure and AI cannot leak or act."""

import asyncio
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from app.ai import client, mentor
from app.ai.guardrails import check_reply, redact
from app.engine import loader


@pytest.fixture
def node():
    return loader.get_scenario("fake_bank_message").nodes["n_msg"]


def fake_provider(monkeypatch, reply):
    calls = []

    async def complete(system, user):
        calls.append((system, user))
        return reply

    monkeypatch.setattr(client, "complete", complete)
    return calls


def test_redact_removes_numbers_and_emails():
    text = redact("my card 4111 1111 1111 1111 and a@b.com, cnic 35202-1234567-1")
    assert "4111" not in text and "a@b.com" not in text and "1234567" not in text


def test_short_numbers_survive_redaction():
    assert "5 PM" in redact("It says blocked at 5 PM")


@pytest.mark.parametrize(
    "reply",
    [
        "Please share your OTP with me.",
        "Apna OTP batayein.",
        "Your code is 246810.",
        "The safest thing is to tap the name.",
        "You should tap the link.",
        "اپنا OTP بتائیں۔",
        "سب سے محفوظ یہ ہے کہ نام پر ٹیپ کریں۔",
        "This message looks like a scam.",
        "This message is real.",
        "Yeh message nakli hai.",
        "یہ پیغام ایک فریب لگ رہا ہے۔",
        "یہ جعلی پیغام ہے۔",
        "word " * 200,
        "",
        None,
    ],
)
def test_unsafe_or_empty_replies_are_refused(reply):
    assert check_reply(reply) is None


def test_approved_facts_are_not_mistaken_for_a_verdict():
    assert check_reply("A real bank never asks for an OTP on a link.")
    assert check_reply("اصلی بینک کبھی لنک پر OTP نہیں مانگتا۔")


@pytest.mark.parametrize(
    "lang,reply",
    [
        ("en", "You could press Check who sent it."),
        ("ur", "“دیکھیں کس نے بھیجا” پر کلک نہ کریں۔"),
        ("ur-Latn", "Link kholein mat."),
    ],
)
def test_reply_naming_an_on_screen_choice_is_refused(monkeypatch, node, lang, reply):
    fake_provider(monkeypatch, reply)
    assert asyncio.run(mentor.answer_question(node, "What now?", lang)) is None


def test_safe_reply_passes():
    assert check_reply("Who sent this message? Look at the name at the top.")


def test_visible_text_never_contains_hidden_engine_data(node):
    text = " ".join(mentor.visible_text(node, "en"))
    assert "SafeTrust Alert" in text and "Check who sent it" in text
    for hidden in ("n_fake_page", "n_sender", "risky", "scam_detection"):
        assert hidden not in text


def test_question_prompt_is_redacted_and_holds_no_outcomes(monkeypatch, node):
    calls = fake_provider(monkeypatch, "Look at the name at the top.")
    answer = asyncio.run(
        mentor.answer_question(node, "my number is 03001234567, is this fake?", "en")
    )
    assert answer == "Look at the name at the top."
    prompt = calls[0][1]
    assert "03001234567" not in prompt
    assert "PKR 48,500" not in prompt


def test_provider_failure_returns_none_so_the_ui_can_fall_back(monkeypatch, node):
    fake_provider(monkeypatch, None)
    assert asyncio.run(mentor.answer_question(node, "What is an OTP?", "en")) is None


def test_prompt_limits_advice_to_approved_facts(monkeypatch, node):
    calls = fake_provider(monkeypatch, "It is a one-time code.")
    asyncio.run(mentor.answer_question(node, "What is an OTP?", "en"))
    assert "add no other security advice" in calls[0][0]
    assert "logos and pictures can be copied" in calls[0][0]


def test_no_provider_configured_means_no_call(monkeypatch):
    monkeypatch.setattr(
        client,
        "get_settings",
        lambda: type("S", (), {"ai_provider": "none", "groq_api_key": ""})(),
    )
    assert asyncio.run(client.complete("s", "u")) is None

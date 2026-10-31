"""Ustad, the mentor: explains and hints, never decides (docs/ARCH.md §10).

Written hints are shown exactly as authored, because safety wording should not be
paraphrased. The model only answers free-text questions, and its prompt only
ever contains text already visible on the learner's screen.
Action targets, risk tags and outcomes are never passed in, so the model cannot
reveal what a choice leads to, and it has no way to change anything.
"""

from typing import Any, List, Optional

from app.ai import client
from app.ai.guardrails import check_reply, redact
from app.engine.models import Node

LANGUAGE_NAMES = {"en": "simple English", "ur-Latn": "simple Roman Urdu"}

SYSTEM_RULES = """You are Ustad, a kind, patient helper for older adults inside a \
practice world called HIMMAT. Nothing in this world is real.

Rules you always follow:
- Reply in {language}, in at most 3 short sentences, using everyday words. Never use \
words like phishing, malicious or authentication.
- Explain words and buttons, and ask a gentle question about what they notice.
- Never say whether this message is real or fake, which choice is correct, or what \
will happen after a choice. The person decides.
- Never ask for, or suggest sharing, a real password, OTP, PIN, card or ID number.
- Never shame the person.
- If the question has nothing to do with this screen, gently bring them back to it.

Only give safety advice from these facts, and add no other security advice:
- An OTP is a one-time code that approves something on your account.
- A real bank never asks for an OTP or password on a link, a call or a message.
- Names, logos and pictures can be copied, so they do not prove who sent a message.
- You can tap the sender's name to see who they are.
- You can compare the website in a message with the one printed on your bank card.
- The helpline printed on your bank card is a safe number to call."""


def _language(lang: str) -> str:
    return LANGUAGE_NAMES.get(lang, LANGUAGE_NAMES["en"])


def visible_text(node: Node, lang: str) -> List[str]:
    """Words the learner can read on this screen, and nothing else."""
    found: List[str] = []

    def walk(value: Any) -> None:
        if isinstance(value, dict):
            if "en" in value and isinstance(value["en"], str):
                found.append(value.get(lang) or value["en"])
                return
            for item in value.values():
                walk(item)
        elif isinstance(value, list):
            for item in value:
                walk(item)

    if node.ui:
        walk(node.ui.props)
    found.extend(
        action.label.get(lang) or action.label["en"] for action in node.actions
    )
    return found


async def answer_question(node: Node, question: str, lang: str) -> Optional[str]:
    screen = "\n".join(f"- {text}" for text in visible_text(node, lang))
    return check_reply(
        await client.complete(
            SYSTEM_RULES.format(language=_language(lang)),
            f"The person's screen shows:\n{screen}\n\nTheir question: {redact(question)}",
        )
    )

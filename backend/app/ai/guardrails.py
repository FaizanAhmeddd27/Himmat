"""Input redaction and output checks for the mentor (SRS NFR-S4, FR-7.7)."""

import re
from typing import Optional

_EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
# Digit runs of 6 or more, allowing the separators people type inside numbers.
_LONG_NUMBER = re.compile(r"\d(?:[\s-]?\d){5,}")

MAX_QUESTION_CHARS = 300
MAX_ANSWER_CHARS = 420

# A mentor reply must never tell someone to hand over a secret or do the risky thing.
_BANNED = re.compile(
    r"(share|send|enter|type|give|tell)\s+(me\s+|us\s+)?(your\s+|the\s+)?"
    r"(otp|code|password|pin|cnic|card number)"
    r"|(apna|apni)\s+(otp|code|password|pin)\s+(batayein|dein|likhein|bhejein)",
    re.IGNORECASE,
)

# The learner decides: a reply must not name the winning choice for them.
_PICKS_ANSWER = re.compile(
    r"\b(safest|best|right|correct)\s+(thing|choice|option|answer|button|move)"
    r"|\byou should (tap|press|click)\b",
    re.IGNORECASE,
)


def redact(text: str) -> str:
    """Strip anything that could be personal before it leaves the server."""
    cleaned = _EMAIL.sub("[email]", text)
    return _LONG_NUMBER.sub("[number]", cleaned)[:MAX_QUESTION_CHARS]


def check_reply(text: Optional[str]) -> Optional[str]:
    """Return the reply if it is safe to show; None sends the caller to the fallback."""
    if not text:
        return None
    reply = text.strip()
    if not reply or len(reply) > MAX_ANSWER_CHARS:
        return None
    if _LONG_NUMBER.search(reply) or _BANNED.search(reply):
        return None
    if _PICKS_ANSWER.search(reply):
        return None
    return reply

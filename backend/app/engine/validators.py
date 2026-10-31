"""Input safety — reject real-looking sensitive data (SRS FR-2.5, NFR-S3).

HIMMAT must never collect real card numbers, CNIC numbers or real-format OTPs.
Validators here are used by the engine on any free-text input.
"""

import re

from app.engine.models import EngineError

# Longest plausible real digit run (phone/account numbers are >= 10 digits;
# cards are 16, CNIC 13). Practice codes are short (4-8 digits).
_MAX_DIGIT_RUN = 8

_DIGIT_RUN = re.compile(r"\d{%d,}" % (_MAX_DIGIT_RUN + 1))


def has_long_digit_run(text: str) -> bool:
    """True if the text contains more than 8 consecutive digits."""
    return bool(_DIGIT_RUN.search(digits_only(text)))


def digits_only(text: str) -> str:
    """Digits left after removing separators commonly used in Pakistan."""
    return re.sub(r"[\s\-–—_.]", "", text or "")


def cnic_like(text: str) -> bool:
    """CNIC shape: 13 digits possibly grouped 5-7-1 or 5-7-1 with dashes."""
    d = digits_only(text)
    return bool(re.fullmatch(r"\d{13}", d))


def card_like(text: str) -> bool:
    """Payment-card shape: 14-16 digits, any grouping."""
    d = digits_only(text)
    return bool(re.fullmatch(r"\d{14,16}", d))


def validate_practice_input(value: str, field_kind: str = "text") -> str:
    """Validate a learner free-text input; raise EngineError on real-looking data.

    field_kind: "otp" (required, short code) or generic "text".
    """
    text = (value or "").strip()

    if field_kind == "otp" and not text:
        raise EngineError(
            code="input_required",
            message="Please type the practice code shown on the screen.",
            status=422,
        )

    if card_like(text):
        raise EngineError(
            code="rejected_real_card",
            message=(
                "This looks like a real card number. "
                "Please use the practice values shown on the screen."
            ),
            status=422,
        )
    if cnic_like(text):
        raise EngineError(
            code="rejected_real_cnic",
            message=(
                "This looks like a real ID number. "
                "Please use the practice values shown on the screen."
            ),
            status=422,
        )
    if has_long_digit_run(text):
        raise EngineError(
            code="rejected_long_number",
            message=(
                "This looks like a real number. "
                "Please use the practice values shown on the screen."
            ),
            status=422,
        )

    return text

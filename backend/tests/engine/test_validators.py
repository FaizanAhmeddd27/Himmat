"""Input safety tests — real-looking sensitive data is rejected gently (FR-2.5)."""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from app.engine.models import EngineError
from app.engine.validators import validate_practice_input


# ---- accepted (practice) inputs ----------------------------------------------


@pytest.mark.parametrize(
    "otp",
    ["246810", "1234", "123456", "12 34 56", "246-810"],
)
def test_short_practice_codes_accepted(otp):
    assert validate_practice_input(otp, "otp") is not None


def test_generic_text_accepted():
    assert validate_practice_input("sahi jawab", "text") == "sahi jawab"


def test_whitespace_stripped():
    assert validate_practice_input("  42  ", "text") == "42"


# ---- rejected (real-looking) inputs ------------------------------------------


def test_16_digit_card_rejected():
    with pytest.raises(EngineError) as exc:
        validate_practice_input("4111 1111 1111 1111", "otp")
    assert exc.value.code == "rejected_real_card"
    # calm tone: message explains and points to practice values — never shames
    assert "card" in exc.value.message.lower()
    assert "practice" in exc.value.message.lower()


def test_13_digit_cnic_rejected():
    with pytest.raises(EngineError) as exc:
        validate_practice_input("42101-1234567-1", "text")
    assert exc.value.code == "rejected_real_cnic"


def test_11_digit_run_rejected():
    with pytest.raises(EngineError) as exc:
        validate_practice_input("03001234567", "otp")
    assert exc.value.code == "rejected_long_number"


def test_13_digit_is_cnic_shaped():
    # Exactly 13 digits is reported as the CNIC check (most specific match).
    with pytest.raises(EngineError) as exc:
        validate_practice_input("0300123456789", "otp")
    assert exc.value.code == "rejected_real_cnic"


def test_15_digit_card_run_rejected():
    with pytest.raises(EngineError) as exc:
        validate_practice_input("411111111111111", "otp")
    assert exc.value.code == "rejected_real_card"


def test_dashes_do_not_hide_long_number():
    with pytest.raises(EngineError):
        validate_practice_input("4111-1111-1111-111-1", "otp")


# ---- empty otp required ------------------------------------------------------


def test_empty_otp_rejected_with_hint():
    with pytest.raises(EngineError) as exc:
        validate_practice_input("", "otp")
    assert exc.value.code == "input_required"
    assert exc.value.status == 422

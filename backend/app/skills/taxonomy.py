"""Skills tracked in Digital DNA, with names, starting points and support tips."""

from typing import Dict, List

from pydantic import BaseModel

from app.engine.models import Languages


class Skill(BaseModel):
    id: str
    name: Languages
    # Sample starting profile for Amna, our demo learner (never a real person's data).
    start: float
    # False until a scenario can actually exercise this skill.
    has_content: bool = True
    tip: Languages


SKILLS: List[Skill] = [
    Skill(
        id="scam_detection",
        name={"en": "Spotting a scam", "ur-Latn": "Dhoka pehchanna"},
        start=30,
        tip={
            "en": "Next time an odd message arrives, ask what she noticed before you say what you think.",
            "ur-Latn": "Agli dafa ajeeb message aaye to pehle poochein unhon ne kya dekha, phir apni rai dein.",
        },
    ),
    Skill(
        id="otp_safety",
        name={"en": "Keeping an OTP safe", "ur-Latn": "OTP mehfooz rakhna"},
        start=35,
        tip={
            "en": "Remind her that nobody, including you or the bank, ever needs her code.",
            "ur-Latn": "Unhein yaad dilayein ke kisi ko, aap ya bank ko bhi, un ka code nahi chahiye.",
        },
    ),
    Skill(
        id="reporting",
        name={"en": "Reporting and blocking", "ur-Latn": "Report aur block karna"},
        start=20,
        tip={
            "en": "Sit with her once and let her block a spam number herself.",
            "ur-Latn": "Aik dafa saath baith kar unhein khud spam number block karne dein.",
        },
    ),
    Skill(
        id="account_recovery",
        name={
            "en": "Recovering after a mistake",
            "ur-Latn": "Ghalti ke baad sambhalna",
        },
        start=15,
        tip={
            "en": "Save the helpline printed on her bank card in her contacts, together.",
            "ur-Latn": "Bank card wala helpline number saath mil kar un ke contacts mein save karein.",
        },
    ),
    Skill(
        id="online_payments",
        name={"en": "Sending money", "ur-Latn": "Paise bhejna"},
        start=40,
        has_content=False,
        tip={
            "en": "Let her send you a small amount while you watch, without touching the phone.",
            "ur-Latn": "Unhein apne saamne thori raqam bhejne dein, phone ko haath lagaye baghair.",
        },
    ),
    Skill(
        id="video_calls",
        name={"en": "Video calls", "ur-Latn": "Video call"},
        start=55,
        has_content=False,
        tip={
            "en": "Ask her to start the next video call herself.",
            "ur-Latn": "Agli video call unhein khud shuru karne ko kahein.",
        },
    ),
]

BY_ID: Dict[str, Skill] = {skill.id: skill for skill in SKILLS}

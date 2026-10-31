"""Shared FastAPI dependencies."""

import re

from fastapi import Header

_SAFE_ID = re.compile(r"^[A-Za-z0-9-]{1,64}$")


def learner_id(x_learner_id: str = Header(default="guest")) -> str:
    """Guest identity from the browser (SRS FR-1.2). Holds no personal data."""
    return x_learner_id if _SAFE_ID.fullmatch(x_learner_id) else "guest"

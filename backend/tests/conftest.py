"""Tests must never reach a real database or AI provider, whatever .env says."""

import os

os.environ["DATABASE_URL"] = ""
os.environ["AI_PROVIDER"] = "none"

"""Provider call for the mentor. Any failure returns None, never an exception."""

import logging
from typing import Optional

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
TIMEOUT_SECONDS = 6.0  # SRS NFR-P2: past this, the written hint is shown instead.


async def complete(system: str, user: str) -> Optional[str]:
    settings = get_settings()
    if settings.ai_provider != "groq" or not settings.groq_api_key:
        return None
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
            response = await client.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {settings.groq_api_key}"},
                json={
                    "model": settings.groq_model,
                    "temperature": 0.2,
                    # Reasoning shares this budget: too small returns empty content.
                    "max_completion_tokens": 1000,
                    "reasoning_effort": "low",
                    "reasoning_format": "hidden",
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": user},
                    ],
                },
            )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except (httpx.HTTPError, KeyError, IndexError, ValueError) as exc:
        logger.warning("Mentor call failed, using written hint: %s", type(exc).__name__)
        return None

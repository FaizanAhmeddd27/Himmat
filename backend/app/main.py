"""HIMMAT FastAPI application factory."""

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import health, scenarios, sessions, skills
from app.config import get_settings
from app.engine.store import get_store
from app.skills.learners import get_learner_store


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    """Open storage before serving, so no learner's tap ever waits on the database."""
    get_store()
    get_learner_store()
    yield


def create_app() -> FastAPI:
    """Build and configure the FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "HIMMAT — Digital Life Simulator backend. "
            "The scenario engine is deterministic and is the only source of truth. "
            "AI is an explanation layer, never the decider."
        ),
        debug=settings.debug,
        lifespan=lifespan,
    )

    # CORS — restrict to known frontend origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    app.include_router(health.router, prefix="/api/v1")
    app.include_router(scenarios.router, prefix="/api/v1")
    app.include_router(sessions.router, prefix="/api/v1")
    app.include_router(skills.router, prefix="/api/v1")

    @app.get("/", include_in_schema=False)
    async def root() -> dict:
        return {
            "app": settings.app_name,
            "version": settings.app_version,
            "docs": "/docs",
            "health": "/api/v1/health",
        }

    return app


app = create_app()

"""Session storage: in-memory dict + JSON file persistence.

A crash-free file store means a refresh mid-game resumes and the server can
restart without losing progress. Swapping to Postgres only touches this module:
the engine never knows how sessions are stored.
"""

import json
import os
import tempfile
import threading
import time
import uuid
from pathlib import Path
from typing import Dict, Optional

from app.engine.models import EngineError, SessionMode, SessionRecord

DATA_DIR = Path(
    os.getenv("HIMMAT_DATA_DIR", Path(__file__).resolve().parent.parent.parent / "data")
)
SESSIONS_FILE = DATA_DIR / "sessions.json"


def write_json_atomic(path: Path, payload: dict) -> None:
    """Write to a temp file first, so a crash never leaves a half-written store."""
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_path = tempfile.mkstemp(dir=path.parent, suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            json.dump(payload, fh, ensure_ascii=False)
        os.replace(tmp_path, path)
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


class SessionStore:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._sessions: Dict[str, SessionRecord] = {}
        self._load()

    # ---- persistence helpers -------------------------------------------------
    def _load(self) -> None:
        if not SESSIONS_FILE.exists():
            return
        try:
            raw = json.loads(SESSIONS_FILE.read_text(encoding="utf-8"))
            for sid, obj in raw.items():
                self._sessions[sid] = SessionRecord.model_validate(obj)
        except (json.JSONDecodeError, OSError, ValueError):
            # Corrupt file: never crash the app, start empty.
            self._sessions = {}

    def _save(self) -> None:
        write_json_atomic(
            SESSIONS_FILE,
            {sid: rec.model_dump(mode="json") for sid, rec in self._sessions.items()},
        )

    # ---- api -------------------------------------------------------------------
    def create(
        self,
        scenario_id: str,
        current_node: str,
        initial_state: dict,
        mode: SessionMode = "practice",
        learner_id: str = "guest",
    ) -> SessionRecord:
        now = time.time()
        session = SessionRecord(
            id=str(uuid.uuid4()),
            scenario_id=scenario_id,
            mode=mode,
            learner_id=learner_id,
            current_node=current_node,
            state=dict(initial_state),
            started_at=now,
            updated_at=now,
        )
        with self._lock:
            self._sessions[session.id] = session
            self._save()
        return session

    def get(self, session_id: str) -> SessionRecord:
        with self._lock:
            session = self._sessions.get(session_id)
        if session is None:
            raise EngineError(
                code="session_not_found",
                message="That practice session could not be found. Please start a new one.",
                status=404,
            )
        return session

    def update(self, session: SessionRecord) -> SessionRecord:
        with self._lock:
            self._sessions[session.id] = session
            self._save()
        return session


_store: Optional[SessionStore] = None


def get_store() -> SessionStore:
    global _store
    if _store is None:
        _store = SessionStore()
    return _store

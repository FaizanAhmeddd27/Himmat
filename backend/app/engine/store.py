"""Session storage: records live in memory and are saved through a backend.

Supabase Postgres when DATABASE_URL is set, JSON files otherwise (see persistence.py).
The engine never knows which one is in use.
"""

import os
import threading
import time
import uuid
from pathlib import Path
from typing import Dict, Optional

from app.engine.models import EngineError, SessionMode, SessionRecord
from app.engine.persistence import make_backend

DATA_DIR = Path(
    os.getenv("HIMMAT_DATA_DIR", Path(__file__).resolve().parent.parent.parent / "data")
)
SESSIONS_FILE = DATA_DIR / "sessions.json"


class SessionStore:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._backend = make_backend("himmat_sessions", SESSIONS_FILE)
        self._sessions: Dict[str, SessionRecord] = {}
        for sid, document in self._backend.load().items():
            try:
                self._sessions[sid] = SessionRecord.model_validate(document)
            except ValueError:
                continue  # An old record this version cannot read: skip that one.

    def _save(self, session: SessionRecord) -> None:
        self._backend.put(session.id, session.model_dump(mode="json"))

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
            self._save(session)
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
            self._save(session)
        return session

    def delete_for_learner(self, learner_id: str) -> None:
        with self._lock:
            for sid, record in list(self._sessions.items()):
                if record.learner_id == learner_id:
                    del self._sessions[sid]
                    self._backend.remove(sid)


_store: Optional[SessionStore] = None


def get_store() -> SessionStore:
    global _store
    if _store is None:
        _store = SessionStore()
    return _store

"""Where sessions and learner profiles are kept: Supabase Postgres, or local files.

The stores hold records in memory, so a slow or lost connection can never stall or
break a learner's practice. Postgres receives every change in order on a background
thread, and all records are loaded back at startup. With no DATABASE_URL, or if the
database cannot be reached at startup, records go to JSON files instead.
"""

import json
import logging
import os
import tempfile
import threading
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Dict, Optional, Protocol

import psycopg
from psycopg.types.json import Jsonb

from app.config import get_settings

logger = logging.getLogger(__name__)

MIGRATION = (
    Path(__file__).resolve().parents[3]
    / "supabase"
    / "migrations"
    / "20261031000000_himmat_store.sql"
)
CONNECT_TIMEOUT_SECONDS = 5


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


class Backend(Protocol):
    def load(self) -> Dict[str, dict]: ...

    def put(self, key: str, document: dict) -> None: ...

    def remove(self, key: str) -> None: ...


class JsonFileBackend:
    def __init__(self, path: Path) -> None:
        self._path = path
        self._documents: Dict[str, dict] = {}

    def load(self) -> Dict[str, dict]:
        if self._path.exists():
            try:
                self._documents = json.loads(self._path.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, OSError, ValueError):
                # Corrupt file: never crash the app, start empty.
                self._documents = {}
        return dict(self._documents)

    def put(self, key: str, document: dict) -> None:
        self._documents[key] = document
        write_json_atomic(self._path, self._documents)

    def remove(self, key: str) -> None:
        self._documents.pop(key, None)
        write_json_atomic(self._path, self._documents)


class PostgresBackend:
    """One table of JSON documents. Writes run in order on one background thread."""

    def __init__(self, url: str, table: str) -> None:
        self._url = url
        self._table = (
            table  # Only ever a constant from this codebase, see make_backend.
        )
        self._connection: Optional[psycopg.Connection] = None
        self._lock = threading.Lock()
        self._writer = ThreadPoolExecutor(max_workers=1, thread_name_prefix=table)

    def _connect(self) -> psycopg.Connection:
        if self._connection is None or self._connection.closed:
            self._connection = psycopg.connect(
                self._url,
                autocommit=True,
                connect_timeout=CONNECT_TIMEOUT_SECONDS,
                prepare_threshold=None,  # Required by Supabase's connection pooler.
            )
        return self._connection

    def _run(self, sql: str, params: tuple) -> None:
        """Retry once with a new connection, because idle ones get dropped."""
        with self._lock:
            for attempt in (1, 2):
                try:
                    self._connect().execute(sql, params)  # type: ignore[arg-type]
                    return
                except psycopg.OperationalError:
                    self._connection = None
                    if attempt == 2:
                        raise

    def prepare(self) -> None:
        """Connect and create the tables if needed. Raises if the database is down."""
        with self._lock:
            connection = self._connect()
            connection.execute(MIGRATION.read_text(encoding="utf-8"))  # type: ignore[arg-type]

    def load(self) -> Dict[str, dict]:
        with self._lock:
            rows = (
                self._connect()
                .execute(f"select id, data from {self._table}")  # type: ignore[arg-type]
                .fetchall()
            )
        return {row[0]: row[1] for row in rows}

    def _write_safely(self, sql: str, params: tuple) -> None:
        try:
            self._run(sql, params)
        except psycopg.Error as exc:
            # The learner keeps going from memory: a lost write must not stop practice.
            logger.warning("Could not save to %s: %s", self._table, type(exc).__name__)

    def put(self, key: str, document: dict) -> None:
        self._writer.submit(
            self._write_safely,
            f"insert into {self._table} (id, data) values (%s, %s) "
            "on conflict (id) do update set data = excluded.data, updated_at = now()",
            (key, Jsonb(document)),
        )

    def remove(self, key: str) -> None:
        self._writer.submit(
            self._write_safely, f"delete from {self._table} where id = %s", (key,)
        )

    def flush(self) -> None:
        """Wait for writes already queued."""
        self._writer.submit(lambda: None).result()


def make_backend(table: str, file_path: Path) -> Backend:
    url = get_settings().database_url
    if url:
        backend = PostgresBackend(url, table)
        try:
            backend.prepare()
            logger.info("Storing %s in Postgres", table)
            return backend
        except (psycopg.Error, OSError) as exc:
            logger.warning(
                "Database unreachable (%s). Storing %s in local files for this run.",
                type(exc).__name__,
                table,
            )
    return JsonFileBackend(file_path)

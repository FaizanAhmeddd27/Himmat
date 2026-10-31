"""Storage: progress survives a restart, and a database outage never stops practice."""

import sys
from pathlib import Path

import psycopg
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from app.config import get_settings
from app.engine import persistence
from app.engine import store as store_module
from app.engine.persistence import JsonFileBackend, PostgresBackend, make_backend
from app.engine.store import SessionStore
from app.skills.learners import LearnerStore


def test_tests_never_use_a_real_database():
    assert get_settings().database_url == ""


def test_file_backend_survives_a_restart(tmp_path):
    path = tmp_path / "docs.json"
    JsonFileBackend(path).put("a", {"n": 1})
    reopened = JsonFileBackend(path)
    assert reopened.load() == {"a": {"n": 1}}
    reopened.remove("a")
    assert JsonFileBackend(path).load() == {}


def test_corrupt_file_starts_empty(tmp_path):
    path = tmp_path / "docs.json"
    path.write_text("{not json", encoding="utf-8")
    assert JsonFileBackend(path).load() == {}


def test_sessions_and_learners_reload_after_restart(tmp_path, monkeypatch):
    monkeypatch.setattr(store_module, "SESSIONS_FILE", tmp_path / "sessions.json")
    monkeypatch.setattr(store_module, "DATA_DIR", tmp_path)

    created = SessionStore().create("fake_bank_message", "n_msg", {"x": 1})
    assert SessionStore().get(created.id).current_node == "n_msg"

    learners = LearnerStore()
    learner = learners.get("amna")
    learner.scores["otp_safety"] = 77
    learners.save(learner)
    assert LearnerStore().find("amna").scores["otp_safety"] == 77


def test_unreachable_database_falls_back_to_files(tmp_path, monkeypatch):
    settings = type("S", (), {"database_url": "postgresql://nobody@localhost:1/none"})()
    monkeypatch.setattr(persistence, "get_settings", lambda: settings)
    monkeypatch.setattr(persistence, "CONNECT_TIMEOUT_SECONDS", 1)
    backend = make_backend("himmat_sessions", tmp_path / "s.json")
    assert isinstance(backend, JsonFileBackend)


def test_lost_write_is_logged_and_does_not_raise(monkeypatch):
    backend = PostgresBackend("postgresql://unused", "himmat_sessions")

    def fail(*_args):
        raise psycopg.OperationalError("connection lost")

    monkeypatch.setattr(backend, "_run", fail)
    backend.put("a", {"n": 1})
    backend.remove("a")
    backend.flush()  # Reaching here means the failures stayed on the writer thread.


def test_migration_locks_tables_from_the_public_api():
    sql = persistence.MIGRATION.read_text(encoding="utf-8")
    for table in ("himmat_sessions", "himmat_learners"):
        assert f"alter table {table} enable row level security" in sql


@pytest.mark.parametrize("table", ["himmat_sessions", "himmat_learners"])
def test_table_names_used_by_the_stores_exist_in_the_migration(table):
    assert table in persistence.MIGRATION.read_text(encoding="utf-8")

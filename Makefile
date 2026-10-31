# HIMMAT — Developer shortcuts
# Usage: make <target>   (on Windows use Git Bash / WSL, or run the underlying command)

.PHONY: dev dev-frontend dev-backend test test-frontend test-backend lint lint-frontend lint-backend validate-scenarios

# ---- Run ----
dev: dev-frontend dev-backend ## Run frontend + backend together (two terminals)

dev-frontend: ## Start Next.js dev server (:3000)
	cd frontend && npm run dev

dev-backend: ## Start FastAPI dev server (:8000)
	cd backend && .venv/Scripts/uvicorn app.main:app --reload --port 8000

# ---- Test ----
test: test-backend test-frontend ## Run all tests

test-backend: ## Pytest
	cd backend && .venv/Scripts/pytest

test-frontend: ## Vitest
	cd frontend && npm test

# ---- Lint ----
lint: lint-backend lint-frontend ## Lint everything

lint-backend: ## Ruff + Black + mypy
	cd backend && .venv/Scripts/ruff check . && .venv/Scripts/black --check . && .venv/Scripts/mypy app

lint-frontend: ## ESLint
	cd frontend && npm run lint

format-backend: ## Auto-format backend
	cd backend && .venv/Scripts/ruff check --fix . && .venv/Scripts/black .

# ---- Scenarios ----
validate-scenarios: ## Validate scenario JSON against schema + graph checks
	cd backend && .venv/Scripts/python scripts/validate_scenarios.py

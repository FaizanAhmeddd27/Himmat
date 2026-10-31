# HIMMAT — Developer shortcuts
# Usage: make <target>   (on Windows use Git Bash / WSL, or run the underlying command)

.PHONY: dev dev-frontend dev-backend test test-frontend test-backend lint lint-frontend lint-backend

# ---- Run ----
dev: dev-frontend dev-backend ## Run frontend + backend together (two terminals)

dev-frontend: ## Start Next.js dev server (:3000)
	cd frontend && npm run dev

dev-backend: ## Start FastAPI dev server (:8000)
	cd backend && .venv/Scripts/python -m uvicorn app.main:app --reload --port 8000

# ---- Test ----
test: test-backend test-frontend ## Run all tests

test-backend: ## Pytest
	cd backend && .venv/Scripts/pytest

test-frontend: ## ESLint and production build
	cd frontend && npm run lint && npm run build

# ---- Lint ----
lint: lint-backend lint-frontend ## Lint everything

lint-backend: ## Ruff + Black + mypy
	cd backend && .venv/Scripts/ruff check . && .venv/Scripts/black --check . && .venv/Scripts/mypy app

lint-frontend: ## ESLint
	cd frontend && npm run lint

format-backend: ## Auto-format backend
	cd backend && .venv/Scripts/ruff check --fix . && .venv/Scripts/black .


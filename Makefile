.PHONY: dev dev-backend dev-frontend lint lint-backend lint-frontend format test build docker clean install

# ──────────────────────────────────────────
# Development
# ──────────────────────────────────────────

install: ## Install all dependencies
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

dev-backend: ## Start backend dev server
	cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

dev-frontend: ## Start frontend dev server
	cd frontend && npm run dev

dev: ## Start both backend and frontend (requires two terminals)
	@echo "Run in separate terminals:"
	@echo "  make dev-backend"
	@echo "  make dev-frontend"

# ──────────────────────────────────────────
# Quality
# ──────────────────────────────────────────

lint-backend: ## Lint backend with ruff
	cd backend && ruff check . && ruff format --check .

lint-frontend: ## Lint frontend with eslint
	cd frontend && npx eslint .

lint: lint-backend lint-frontend ## Lint everything

format: ## Auto-format backend code
	cd backend && ruff check --fix . && ruff format .

test: ## Run backend tests
	cd backend && pytest

# ──────────────────────────────────────────
# Build
# ──────────────────────────────────────────

build: ## Build frontend for production
	cd frontend && npm run build

docker: ## Start all services with Docker Compose
	docker compose up --build

docker-down: ## Stop Docker Compose services
	docker compose down

# ──────────────────────────────────────────
# Cleanup
# ──────────────────────────────────────────

clean: ## Remove build artifacts and caches
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .ruff_cache -exec rm -rf {} + 2>/dev/null || true
	rm -rf backend/htmlcov backend/.coverage backend/coverage.xml backend/coverage.json
	rm -rf frontend/.next frontend/out

# ──────────────────────────────────────────
# Help
# ──────────────────────────────────────────

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help

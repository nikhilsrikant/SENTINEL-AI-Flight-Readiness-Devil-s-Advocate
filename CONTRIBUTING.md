# Contributing to SENTINEL

Thank you for your interest in contributing to the SENTINEL AI Flight Readiness Platform!

## Getting Started

1. **Fork the repository** and clone your fork locally
2. **Set up your environment** following the [README](README.md#quick-start)
3. **Create a branch** for your feature or fix: `git checkout -b feat/your-feature`

## Development Workflow

### Backend (Python/FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

### Frontend (Next.js/TypeScript)

```bash
cd frontend
npm install
npm run dev
```

### Running Tests

```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm test
```

## Code Style

- **Python**: Follow PEP 8, use type hints, docstrings on public functions
- **TypeScript**: Strict mode, explicit return types on exported functions
- **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`)

## Pull Request Process

1. Ensure your code passes all existing tests
2. Add tests for new functionality
3. Update documentation if you change public APIs
4. Keep PRs focused -- one feature or fix per PR
5. Write a clear PR description explaining the "what" and "why"

## Architecture Guidelines

- **Backend modules** live in `backend/services/` with corresponding routers in `backend/routers/`
- **Pydantic models** go in `backend/models/` -- keep frontend types in sync in `frontend/src/lib/types.ts`
- **Mock data** goes in `backend/mock_data/` -- every endpoint must work in mock mode
- **AI calls** go through the Granite Client (`backend/clients/`) -- never call providers directly from services

## Reporting Issues

- Use GitHub Issues for bugs and feature requests
- Include reproduction steps for bugs
- Label appropriately: `bug`, `enhancement`, `documentation`

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

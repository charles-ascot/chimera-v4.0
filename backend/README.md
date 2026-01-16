# Chimera v4.0 Backend

FastAPI service that trains/evaluates the paper-method models and serves predictions.

## Local run

```bash
python -m venv .venv && source .venv/bin/activate
pip install -U pip
pip install -e .
uvicorn app.main:app --reload --port 8080
```

## Environment

See `../docs/ENV_VARS.md`.

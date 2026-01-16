# chimera-v4.0 (Paper-Method Pre-Runner)

**Copyright (c) 2026 Ascot Wealth Management.**

This repo implements the **International Journal paper pipeline** end-to-end:

- Tabular runner-level dataset (22 features + binary `position` label)
- Stratified 5-fold cross-validation
- **SMOTE** with **k=5** (training folds only)
- Models: Logistic Regression, KNN, Naive Bayes, Random Forest
- Metrics: Accuracy, F1, ROC-AUC

## Monorepo layout

- `frontend/` → Cloudflare Pages (React/Vite)
- `backend/` → Google Cloud Run (containerized FastAPI)
- `docs/` → build + env var + endpoint reference

## Quickstart (local)

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -U pip
pip install -e .
uvicorn app.main:app --reload --port 8080
```

### Frontend

```bash
cd frontend
npm i
npm run dev
```

Create `.env.local` in `frontend/`:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

## Styling

The frontend uses the **exact** `main.css` you provided (imported globally). The background image path is:

- `frontend/public/static/assets/images/chimera.png`

Drop `chimera.png` there.

Intro video (optional, plays once per browser):

- `frontend/public/static/assets/videos/chimera1-bg.mp4`

## Deployment

GitHub Actions workflows:

- `frontend-cloudflare-pages.yml`
- `backend-cloudrun.yml`

See `docs/TECH_STACK.md` and `docs/ENV_VARS.md`.

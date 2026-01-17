# CHIMERA v4

## Multi-Agent AI Horse Racing Prediction Platform

**Copyright 2026 Ascot Wealth Management**

---

## Overview

CHIMERA v4 is a sophisticated multi-agent AI platform for horse racing predictions, implementing the methodology from academic research that achieved **97.6% ROC-AUC accuracy** using Random Forest with SMOTE oversampling.

## Features

- 🤖 **Multi-Agent Architecture**: Conductor AI orchestrating 5 specialized agents
- 🧠 **ML Models**: Random Forest, Logistic Regression, k-NN, Naive Bayes
- ⚖️ **SMOTE**: Handles imbalanced data (99.56% class balance)
- 📊 **Analysis**: EDA, feature analysis, correlation analysis
- 📈 **Backtesting**: Historical strategy testing with risk metrics
- 🎯 **Predictions**: Race winner predictions with confidence scores

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Framer Motion |
| Backend | FastAPI, Python 3.11 |
| ML | scikit-learn, imbalanced-learn |
| Cloud | Google Cloud Run, Cloudflare Pages |
| Storage | Google Cloud Storage, BigQuery |

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Deployment

- **Backend**: Auto-deploys to Cloud Run via GitHub Actions
- **Frontend**: Auto-deploys to Cloudflare Pages via GitHub Actions

## URLs

- **Frontend**: https://chimera4.thync.online
- **Backend**: https://chimera-v4-950990732577.us-central1.run.app
- **API Docs**: {backend-url}/docs

## Documentation

See `/project-docs/TECHNICAL_DOCUMENTATION.md` for full technical details.

## License

Proprietary - Ascot Wealth Management 2026

# Backend Endpoints

Base path: `/api`

| Method | Path | Purpose | Returns |
|---|---|---|---|
| GET | `/dataset/summary` | Dataset stats + feature contract | rows, cols, positive rate, feature columns |
| POST | `/train` | Train + evaluate requested models | best model + metrics + ROC + artifact uri |
| GET | `/metrics` | Read latest trained metrics from artifact store | best model + metrics + ROC |
| POST | `/predict` | Score a single runner row | win probability |

Non-API:
- GET `/healthz`
- GET `/docs` (Swagger)

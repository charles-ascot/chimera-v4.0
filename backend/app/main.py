"""Chimera v4.0 pre-runner backend.

Implements the paper-style pipeline:
- load runner-level dataset (numeric features)
- stratified 5-fold CV
- SMOTE(k=5) within each fold
- train/evaluate LR, KNN, NB, RF
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.settings import settings
from app.api.routes import router

app = FastAPI(
    title="Chimera v4.0 Backend",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/healthz")
def healthz():
    return {
        "ok": True,
        "service": "chimera-backend",
        "environment": settings.environment,
    }

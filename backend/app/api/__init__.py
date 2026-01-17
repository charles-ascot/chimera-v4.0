"""
CHIMERA v4 - API Routes
Copyright 2026 Ascot Wealth Management
"""

from fastapi import APIRouter
from app.api.endpoints import (
    health,
    models,
    predictions,
    training,
    analysis,
    backtest,
    agents,
    data
)

router = APIRouter()

# Health & Status
router.include_router(health.router, prefix="/health", tags=["Health"])

# Core ML Operations
router.include_router(models.router, prefix="/models", tags=["Models"])
router.include_router(training.router, prefix="/training", tags=["Training"])
router.include_router(predictions.router, prefix="/predictions", tags=["Predictions"])

# Analysis & Insights
router.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
router.include_router(backtest.router, prefix="/backtest", tags=["Backtest"])

# Agent Management
router.include_router(agents.router, prefix="/agents", tags=["Agents"])

# Data Ingestion (Framework only - to be connected later)
router.include_router(data.router, prefix="/data", tags=["Data"])

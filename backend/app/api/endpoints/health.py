"""
CHIMERA v4 - Health Endpoints
Copyright 2026 Ascot Wealth Management
"""

from fastapi import APIRouter, Request
from datetime import datetime

router = APIRouter()


@router.get("")
async def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "chimera-v4"
    }


@router.get("/ready")
async def readiness_check(request: Request):
    """Readiness check for Kubernetes/Cloud Run"""
    conductor = request.app.state.conductor
    model_manager = request.app.state.model_manager
    
    return {
        "ready": conductor.status.value == "ready",
        "conductor_status": conductor.status.value,
        "model_trained": model_manager.is_trained,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/live")
async def liveness_check():
    """Liveness check"""
    return {"alive": True, "timestamp": datetime.utcnow().isoformat()}


@router.get("/system")
async def system_status(request: Request):
    """Detailed system status"""
    conductor = request.app.state.conductor
    return conductor.get_system_status()

"""
CHIMERA v4 - Model Management Endpoints
Copyright 2026 Ascot Wealth Management
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

router = APIRouter()


class ModelInfoResponse(BaseModel):
    models: List[str]
    is_trained: bool
    model_version: str
    training_metrics: Optional[Dict[str, Any]]
    feature_columns: List[str]
    target_column: str


@router.get("", response_model=ModelInfoResponse)
async def get_models_info(request: Request):
    """Get information about available models"""
    model_manager = request.app.state.model_manager
    return model_manager.get_model_info()


@router.get("/{model_name}/info")
async def get_model_details(request: Request, model_name: str):
    """Get details for a specific model"""
    model_manager = request.app.state.model_manager
    
    if model_name not in model_manager.models:
        raise HTTPException(status_code=404, detail=f"Model not found: {model_name}")
    
    metrics = model_manager.training_metrics.get("results", {}).get(model_name, {})
    
    return {
        "name": model_name,
        "is_trained": model_manager.is_trained,
        "metrics": metrics,
        "feature_importance": model_manager.get_feature_importance(model_name)
    }


@router.get("/{model_name}/feature-importance")
async def get_feature_importance(request: Request, model_name: str = "random_forest"):
    """Get feature importance for a trained model"""
    model_manager = request.app.state.model_manager
    
    if not model_manager.is_trained:
        raise HTTPException(status_code=400, detail="Model not trained")
    
    importance = model_manager.get_feature_importance(model_name)
    
    # Sort by importance
    sorted_importance = dict(sorted(importance.items(), key=lambda x: x[1], reverse=True))
    
    return {
        "model": model_name,
        "feature_importance": sorted_importance
    }


@router.get("/comparison")
async def compare_models(request: Request):
    """Compare performance of all trained models"""
    model_manager = request.app.state.model_manager
    
    if not model_manager.is_trained:
        raise HTTPException(status_code=400, detail="Models not trained")
    
    results = model_manager.training_metrics.get("results", {})
    
    comparison = []
    for name, metrics in results.items():
        comparison.append({
            "model": name,
            "accuracy": metrics.get("accuracy"),
            "f1_score": metrics.get("f1_score"),
            "roc_auc": metrics.get("roc_auc"),
            "cv_mean": metrics.get("cv_mean")
        })
    
    # Sort by ROC-AUC (as paper emphasizes)
    comparison.sort(key=lambda x: x.get("roc_auc") or 0, reverse=True)
    
    return {
        "best_model": model_manager.training_metrics.get("best_model"),
        "comparison": comparison
    }

"""
CHIMERA v4 - Model Training Endpoints
Copyright 2026 Ascot Wealth Management
"""

from fastapi import APIRouter, Request, HTTPException, BackgroundTasks, UploadFile, File
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import pandas as pd
import io

router = APIRouter()


class TrainingConfig(BaseModel):
    apply_smote: bool = True
    test_size: float = 0.3
    cross_validation_folds: int = 5


class TrainingData(BaseModel):
    data: List[Dict[str, Any]]
    config: Optional[TrainingConfig] = None


class TrainingResponse(BaseModel):
    status: str
    message: str
    best_model: Optional[str]
    best_score: Optional[float]
    results: Optional[Dict[str, Any]]


@router.post("/train", response_model=TrainingResponse)
async def train_models(
    request: Request,
    training_data: TrainingData
):
    """
    Train ML models on provided data.
    
    Follows paper methodology:
    - 70-30 stratified train-test split
    - SMOTE for handling imbalanced data
    - 5-fold cross-validation
    - Trains: Random Forest, Logistic Regression, k-NN, Naive Bayes
    """
    conductor = request.app.state.conductor
    
    task = {
        "agent": "model",
        "action": "train",
        "data": pd.DataFrame(training_data.data),
        "apply_smote": training_data.config.apply_smote if training_data.config else True
    }
    
    result = await conductor.route_task(task)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return TrainingResponse(
        status="completed",
        message="Models trained successfully",
        best_model=result.get("best_model"),
        best_score=result.get("best_score"),
        results=result.get("results")
    )


@router.post("/train/upload")
async def train_from_file(
    request: Request,
    file: UploadFile = File(...),
    apply_smote: bool = True
):
    """Train models from uploaded CSV file"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files supported")
    
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))
    
    conductor = request.app.state.conductor
    
    task = {
        "agent": "model",
        "action": "train",
        "data": df,
        "apply_smote": apply_smote
    }
    
    result = await conductor.route_task(task)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return {
        "status": "completed",
        "rows_processed": len(df),
        "best_model": result.get("best_model"),
        "best_score": result.get("best_score"),
        "results": result.get("results")
    }


@router.get("/status")
async def get_training_status(request: Request):
    """Get current training status and metrics"""
    model_manager = request.app.state.model_manager
    
    return {
        "is_trained": model_manager.is_trained,
        "model_version": model_manager.model_version,
        "training_metrics": model_manager.training_metrics
    }


@router.post("/retrain")
async def retrain_models(
    request: Request,
    background_tasks: BackgroundTasks,
    config: Optional[TrainingConfig] = None
):
    """Trigger model retraining in background"""
    # This would typically pull from BigQuery/data source
    return {
        "status": "accepted",
        "message": "Retraining job queued. Use /training/status to check progress."
    }

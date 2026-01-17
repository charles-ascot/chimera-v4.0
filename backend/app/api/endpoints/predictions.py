"""
CHIMERA v4 - Prediction Endpoints
Copyright 2026 Ascot Wealth Management
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import pandas as pd

router = APIRouter()


class HorseData(BaseModel):
    """Single horse data for prediction"""
    horse_id: Optional[str] = None
    horse_seq: Optional[int] = None
    age: Optional[float] = None
    weight: Optional[float] = None
    body_weight: Optional[float] = None
    draw: Optional[int] = None
    sex: Optional[str] = None
    shoe: Optional[str] = None
    jockey_id: Optional[str] = None
    trainer_id: Optional[str] = None
    owner_id: Optional[str] = None
    race_no_id: Optional[str] = None
    distance: Optional[float] = None
    track: Optional[str] = None
    penetrometer: Optional[float] = None
    season: Optional[str] = None
    club_name: Optional[str] = None
    race_fav_horse: Optional[str] = None
    allowance: Optional[float] = None
    dam: Optional[str] = None
    sire: Optional[str] = None
    color: Optional[str] = None


class RacePredictionRequest(BaseModel):
    """Request for race prediction with all runners"""
    race_id: Optional[str] = None
    runners: List[HorseData]
    model_name: str = "random_forest"


class SinglePredictionRequest(BaseModel):
    """Single prediction request"""
    data: List[Dict[str, Any]]
    model_name: str = "random_forest"


class PredictionResult(BaseModel):
    rank: int
    horse_id: Optional[str]
    horse_seq: Optional[int]
    win_probability: float
    confidence: str


class RacePredictionResponse(BaseModel):
    race_id: Optional[str]
    model: str
    model_version: str
    num_runners: int
    rankings: List[PredictionResult]
    predicted_winner: Optional[PredictionResult]


@router.post("/race", response_model=RacePredictionResponse)
async def predict_race(
    request: Request,
    prediction_request: RacePredictionRequest
):
    """
    Predict winner for a race with all runners.
    
    Returns ranked predictions with win probabilities and confidence levels.
    Uses Random Forest model by default (97.6% accuracy per paper).
    """
    conductor = request.app.state.conductor
    model_manager = request.app.state.model_manager
    
    if not model_manager.is_trained:
        raise HTTPException(
            status_code=400, 
            detail="Model not trained. Please train the model first."
        )
    
    # Convert to list of dicts
    race_data = [r.model_dump() for r in prediction_request.runners]
    
    # Get predictions
    result = await model_manager.predict_race(race_data)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return RacePredictionResponse(
        race_id=prediction_request.race_id or result.get("race_id"),
        model=result.get("model"),
        model_version=result.get("model_version"),
        num_runners=result.get("num_runners"),
        rankings=[PredictionResult(**r) for r in result.get("rankings", [])],
        predicted_winner=PredictionResult(**result["predicted_winner"]) if result.get("predicted_winner") else None
    )


@router.post("/batch")
async def batch_predict(
    request: Request,
    prediction_request: SinglePredictionRequest
):
    """
    Batch prediction for multiple horses/races.
    
    Returns predictions and probabilities for each input.
    """
    conductor = request.app.state.conductor
    model_manager = request.app.state.model_manager
    
    if not model_manager.is_trained:
        raise HTTPException(
            status_code=400, 
            detail="Model not trained. Please train the model first."
        )
    
    df = pd.DataFrame(prediction_request.data)
    
    result = await model_manager.predict(df, prediction_request.model_name)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@router.get("/models")
async def get_available_models(request: Request):
    """Get list of available prediction models"""
    model_manager = request.app.state.model_manager
    
    models = []
    for name in model_manager.models.keys():
        metrics = model_manager.training_metrics.get("results", {}).get(name, {})
        models.append({
            "name": name,
            "accuracy": metrics.get("accuracy"),
            "roc_auc": metrics.get("roc_auc"),
            "recommended": name == "random_forest"  # Paper's best performer
        })
    
    return {
        "models": models,
        "default": "random_forest",
        "is_trained": model_manager.is_trained
    }

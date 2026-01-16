from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.core.schemas import (
    DatasetSummary,
    TrainRequest,
    TrainResponse,
    PredictRequest,
    PredictResponse,
    MetricsResponse,
)
from app.core.dataset import load_dataset, summarize_dataset
from app.core.training import train_and_evaluate
from app.core.inference import load_best_model, predict_one

router = APIRouter()


@router.get("/dataset/summary", response_model=DatasetSummary)
def dataset_summary():
    df = load_dataset()
    return summarize_dataset(df)


@router.post("/train", response_model=TrainResponse)
def train(req: TrainRequest):
    try:
        result = train_and_evaluate(req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return result


@router.get("/metrics", response_model=MetricsResponse)
def metrics():
    model_bundle = load_best_model()
    if model_bundle is None:
        raise HTTPException(status_code=404, detail="No trained model found")
    return model_bundle.metrics


@router.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    model_bundle = load_best_model()
    if model_bundle is None:
        raise HTTPException(status_code=404, detail="No trained model found")
    try:
        proba = predict_one(model_bundle, req.features)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return PredictResponse(probability=float(proba), threshold=model_bundle.threshold)

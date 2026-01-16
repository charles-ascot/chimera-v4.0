from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class DatasetSummary(BaseModel):
    rows: int
    columns: int
    target_column: str
    positive_rate: float
    feature_columns: List[str]


class TrainRequest(BaseModel):
    # Which models to train; default trains all paper models
    models: List[str] = Field(default_factory=lambda: ["lr", "knn", "nb", "rf"])
    # Optional threshold for converting proba→class in UI; metrics computed at default 0.5
    decision_threshold: float = 0.5


class RocCurve(BaseModel):
    fpr: List[float]
    tpr: List[float]
    thresholds: List[float]


class ModelMetrics(BaseModel):
    model_key: str
    accuracy_mean: float
    accuracy_std: float
    f1_mean: float
    f1_std: float
    roc_auc_mean: float
    roc_auc_std: float


class MetricsResponse(BaseModel):
    best_model: str
    metrics: List[ModelMetrics]
    roc: Optional[RocCurve] = None
    trained_at: str


class TrainResponse(MetricsResponse):
    artifact_uri: str


class PredictRequest(BaseModel):
    features: Dict[str, Any]


class PredictResponse(BaseModel):
    probability: float
    threshold: float

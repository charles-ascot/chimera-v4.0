from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Dict, Optional

import joblib
import numpy as np

from app.settings import settings
from app.core.storage_gcs import gcs_download_bytes
from app.core.schemas import MetricsResponse, ModelMetrics, RocCurve


@dataclass
class LoadedBundle:
    model_key: str
    model: Any
    feature_columns: list[str]
    threshold: float
    metrics: MetricsResponse


_cached: Optional[LoadedBundle] = None


def load_best_model() -> Optional[LoadedBundle]:
    global _cached
    if _cached is not None:
        return _cached

    if not settings.gcs_bucket:
        return None

    prefix = settings.artifact_prefix.rstrip("/")
    meta_uri = f"gs://{settings.gcs_bucket}/{prefix}/latest/meta.json"
    model_uri = f"gs://{settings.gcs_bucket}/{prefix}/latest/model.joblib"

    try:
        meta_bytes = gcs_download_bytes(meta_uri)
        model_bytes = gcs_download_bytes(model_uri)
    except Exception:
        return None

    meta = json.loads(meta_bytes.decode("utf-8"))
    model = joblib.load(io := _bytes_io(model_bytes))

    roc = None
    if meta.get("metrics", {}).get("roc"):
        r = meta["metrics"]["roc"]
        roc = RocCurve(fpr=r["fpr"], tpr=r["tpr"], thresholds=r["thresholds"])

    metrics_rows = [ModelMetrics(**m) for m in meta["metrics"]["metrics"]]
    metrics = MetricsResponse(
        best_model=meta["metrics"]["best_model"],
        metrics=metrics_rows,
        roc=roc,
        trained_at=meta["metrics"]["trained_at"],
    )

    _cached = LoadedBundle(
        model_key=meta["model_key"],
        model=model,
        feature_columns=meta["feature_columns"],
        threshold=float(meta.get("threshold", 0.5)),
        metrics=metrics,
    )
    return _cached


def _bytes_io(b: bytes):
    import io

    return io.BytesIO(b)


def predict_one(bundle: LoadedBundle, features: Dict[str, Any]) -> float:
    # Align columns
    x = np.array([[float(features.get(c, 0.0)) for c in bundle.feature_columns]], dtype=float)
    if hasattr(bundle.model, "predict_proba"):
        return float(bundle.model.predict_proba(x)[:, 1][0])
    return float(bundle.model.predict(x)[0])

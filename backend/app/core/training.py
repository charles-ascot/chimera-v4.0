from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
from imblearn.over_sampling import SMOTE
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score, roc_curve
from sklearn.model_selection import StratifiedKFold
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import RandomForestClassifier

from app.settings import settings
from app.core.dataset import load_dataset, _resolve_feature_columns
from app.core.storage_gcs import maybe_upload_bytes
from app.core.schemas import ModelMetrics, RocCurve, TrainRequest, TrainResponse


MODEL_FACTORIES: Dict[str, Callable[[], Any]] = {
    "lr": lambda: LogisticRegression(max_iter=2000, solver="liblinear"),
    "knn": lambda: KNeighborsClassifier(n_neighbors=5),
    "nb": lambda: GaussianNB(),
    "rf": lambda: RandomForestClassifier(
        n_estimators=400,
        random_state=settings.random_seed,
        n_jobs=-1,
    ),
}


@dataclass
class ModelBundle:
    model_key: str
    model: Any
    feature_columns: List[str]
    threshold: float
    metrics: Any


def train_and_evaluate(req: TrainRequest) -> TrainResponse:
    df = load_dataset()
    target = settings.target_column
    if target not in df.columns:
        raise ValueError(f"Target column '{target}' not found")

    feature_cols = _resolve_feature_columns(df)
    X = df[feature_cols]
    y = df[target].astype(int)

    # Hard requirement (keeps SMOTE sane + matches 'paper dataset exactly')
    non_numeric = [c for c in feature_cols if not pd.api.types.is_numeric_dtype(X[c])]
    if non_numeric:
        raise ValueError(
            "Dataset contains non-numeric feature columns. "
            "This pre-runner expects the paper-style numeric dataset. "
            f"Non-numeric: {non_numeric}"
        )

    X_np = X.to_numpy(dtype=float)
    y_np = y.to_numpy(dtype=int)

    models = [m for m in req.models if m in MODEL_FACTORIES]
    if not models:
        raise ValueError("No valid models requested. Use: lr, knn, nb, rf")

    kf = StratifiedKFold(n_splits=settings.cv_splits, shuffle=True, random_state=settings.random_seed)

    metrics_rows: List[ModelMetrics] = []
    best_key = None
    best_score = -1.0

    # For best-model ROC curve we need out-of-fold probs
    best_oof_probs = None

    for key in models:
        factory = MODEL_FACTORIES[key]
        accs: List[float] = []
        f1s: List[float] = []
        aucs: List[float] = []
        oof_probs = np.zeros_like(y_np, dtype=float)

        for train_idx, test_idx in kf.split(X_np, y_np):
            X_train, y_train = X_np[train_idx], y_np[train_idx]
            X_test, y_test = X_np[test_idx], y_np[test_idx]

            # SMOTE within fold (paper: k=5)
            smote = SMOTE(k_neighbors=settings.smote_k_neighbors, random_state=settings.random_seed)
            X_res, y_res = smote.fit_resample(X_train, y_train)

            model = factory()
            model.fit(X_res, y_res)

            # Predict
            if hasattr(model, "predict_proba"):
                probs = model.predict_proba(X_test)[:, 1]
            else:
                # fallback
                probs = model.predict(X_test).astype(float)

            preds = (probs >= 0.5).astype(int)

            oof_probs[test_idx] = probs
            accs.append(float(accuracy_score(y_test, preds)))
            f1s.append(float(f1_score(y_test, preds, zero_division=0)))

            # ROC-AUC requires both classes in fold; guard for edge cases
            try:
                aucs.append(float(roc_auc_score(y_test, probs)))
            except ValueError:
                aucs.append(float("nan"))

        auc_mean = float(np.nanmean(aucs))
        metrics_rows.append(
            ModelMetrics(
                model_key=key,
                accuracy_mean=float(np.mean(accs)),
                accuracy_std=float(np.std(accs)),
                f1_mean=float(np.mean(f1s)),
                f1_std=float(np.std(f1s)),
                roc_auc_mean=auc_mean,
                roc_auc_std=float(np.nanstd(aucs)),
            )
        )

        if auc_mean > best_score:
            best_score = auc_mean
            best_key = key
            best_oof_probs = oof_probs

    assert best_key is not None

    # Train best model on full data with SMOTE
    smote_full = SMOTE(k_neighbors=settings.smote_k_neighbors, random_state=settings.random_seed)
    X_res, y_res = smote_full.fit_resample(X_np, y_np)
    best_model = MODEL_FACTORIES[best_key]()
    best_model.fit(X_res, y_res)

    # ROC curve from OOF probs
    roc = None
    if best_oof_probs is not None:
        fpr, tpr, thr = roc_curve(y_np, best_oof_probs)
        roc = RocCurve(
            fpr=[float(x) for x in fpr],
            tpr=[float(x) for x in tpr],
            thresholds=[float(x) for x in thr],
        )

    trained_at = datetime.now(timezone.utc).isoformat()

    payload = {
        "model_key": best_key,
        "feature_columns": feature_cols,
        "threshold": req.decision_threshold,
        "trained_at": trained_at,
        "metrics": {
            "best_model": best_key,
            "metrics": [m.model_dump() for m in metrics_rows],
            "roc": roc.model_dump() if roc else None,
            "trained_at": trained_at,
        },
    }

    # Write artifacts
    artifact_name = f"{trained_at.replace(':', '').replace('+', '_')}_{best_key}"
    local_model_path = f"/tmp/chimera_model_{artifact_name}.joblib"
    local_meta_path = f"/tmp/chimera_meta_{artifact_name}.json"

    joblib.dump(best_model, local_model_path)
    with open(local_meta_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    # Upload to GCS if configured
    model_bytes = open(local_model_path, "rb").read()
    meta_bytes = open(local_meta_path, "rb").read()

    model_uri = maybe_upload_bytes(
        model_bytes,
        f"{settings.artifact_prefix}/model/{artifact_name}.joblib",
        content_type="application/octet-stream",
    )
    meta_uri = maybe_upload_bytes(
        meta_bytes,
        f"{settings.artifact_prefix}/meta/{artifact_name}.json",
        content_type="application/json",
    )

    # Also store a 'latest' pointer for convenience
    maybe_upload_bytes(
        model_bytes,
        f"{settings.artifact_prefix}/latest/model.joblib",
        content_type="application/octet-stream",
    )
    maybe_upload_bytes(
        meta_bytes,
        f"{settings.artifact_prefix}/latest/meta.json",
        content_type="application/json",
    )

    artifact_uri = meta_uri or "(local-only)"

    return TrainResponse(
        best_model=best_key,
        metrics=metrics_rows,
        roc=roc,
        trained_at=trained_at,
        artifact_uri=artifact_uri,
    )

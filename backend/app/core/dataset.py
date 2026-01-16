from __future__ import annotations

import io
import os
import tempfile
from dataclasses import dataclass

import pandas as pd

from app.settings import settings
from app.core.storage_gcs import gcs_download_bytes


SUPPORTED_EXTS = (".csv", ".parquet")


def _read_df_from_bytes(uri: str, data: bytes) -> pd.DataFrame:
    if uri.endswith(".csv"):
        return pd.read_csv(io.BytesIO(data))
    if uri.endswith(".parquet"):
        return pd.read_parquet(io.BytesIO(data))
    raise ValueError(f"Unsupported dataset format for {uri}. Use one of: {SUPPORTED_EXTS}")


def load_dataset() -> pd.DataFrame:
    """Load the runner-level dataset.

    dataset_uri:
      - local path inside container (recommended for local dev)
      - gs://bucket/path/to/file.csv|parquet
    """
    uri = settings.dataset_uri.strip()
    if not uri:
        raise ValueError("DATASET_URI is not configured")

    if uri.startswith("gs://"):
        data = gcs_download_bytes(uri)
        df = _read_df_from_bytes(uri, data)
        return df

    # local
    if not os.path.exists(uri):
        raise ValueError(f"Dataset path not found: {uri}")
    if uri.endswith(".csv"):
        return pd.read_csv(uri)
    if uri.endswith(".parquet"):
        return pd.read_parquet(uri)

    raise ValueError(f"Unsupported dataset format for {uri}. Use one of: {SUPPORTED_EXTS}")


def summarize_dataset(df: pd.DataFrame):
    target = settings.target_column
    if target not in df.columns:
        raise ValueError(f"Target column '{target}' not found")

    y = df[target]
    pos_rate = float((y == 1).mean())

    feature_cols = _resolve_feature_columns(df)

    return {
        "rows": int(len(df)),
        "columns": int(df.shape[1]),
        "target_column": target,
        "positive_rate": pos_rate,
        "feature_columns": feature_cols,
    }


def _resolve_feature_columns(df: pd.DataFrame) -> list[str]:
    if settings.feature_columns_csv.strip():
        cols = [c.strip() for c in settings.feature_columns_csv.split(",") if c.strip()]
        missing = [c for c in cols if c not in df.columns]
        if missing:
            raise ValueError(f"Configured feature columns missing: {missing}")
        return cols

    # Default: all columns except target
    return [c for c in df.columns if c != settings.target_column]

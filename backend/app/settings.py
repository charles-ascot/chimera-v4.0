from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    environment: str = "dev"

    # Frontend origin (Cloudflare Pages domain) + local dev
    cors_allow_origins: list[str] = [
        "http://localhost:5173",
        "https://chimera4.thync.online",
    ]

    # Dataset location
    # Supported: local path (container) OR gs://bucket/path
    dataset_uri: str = ""

    # Target column name for binary label
    target_column: str = "position"

    # Artifact storage
    # If gcs_bucket is set, artifacts are written to gs://<bucket>/<artifact_prefix>/...
    gcs_bucket: str = ""
    artifact_prefix: str = "chimera/artifacts"

    # Training config (paper defaults)
    cv_splits: int = 5
    smote_k_neighbors: int = 5
    random_seed: int = 42

    # Optional: restrict training columns (comma-separated) if dataset has extra fields
    feature_columns_csv: str = ""


settings = Settings()

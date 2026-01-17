"""
CHIMERA v4 - Configuration Settings
Copyright 2026 Ascot Wealth Management
"""

import os
from typing import Optional, List
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application
    APP_NAME: str = "CHIMERA v4"
    APP_VERSION: str = "4.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    
    # API
    API_PREFIX: str = "/api/v1"
    SECRET_KEY: str = "chimera-v4-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://chimera4.thync.online"
    ]
    
    # Google Cloud
    GCP_PROJECT_ID: str = "chimera-v4"
    GCP_PROJECT_NUMBER: str = "950990732577"
    GCS_BUCKET_NAME: str = "chimera-v4-data"
    GCS_MODELS_BUCKET: str = "chimera-v4-models"
    
    # BigQuery
    BQ_DATASET: str = "horse_racing"
    BQ_RACES_TABLE: str = "races"
    BQ_PREDICTIONS_TABLE: str = "predictions"
    BQ_TRAINING_DATA_TABLE: str = "training_data"
    
    # ML Model Settings
    MODEL_VERSION: str = "1.0.0"
    SMOTE_K_NEIGHBORS: int = 5
    RANDOM_FOREST_N_ESTIMATORS: int = 100
    CROSS_VALIDATION_FOLDS: int = 5
    TRAIN_TEST_SPLIT: float = 0.7
    
    # AI Agent Settings
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    DEFAULT_LLM_MODEL: str = "gpt-4-turbo-preview"
    
    # Redis (for caching)
    REDIS_URL: str = "redis://localhost:6379"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()

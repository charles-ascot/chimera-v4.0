"""
CHIMERA v4 - ML Model Manager
Copyright 2026 Ascot Wealth Management

Implements the methodology from:
"Predicting Outcomes of Horse Racing using Machine Learning"
- SMOTE for imbalanced data handling
- Random Forest Classifier (97.6% accuracy)
- Logistic Regression, k-NN, Naive Bayes as comparison models
- 70-30 train-test split with 5-fold cross-validation
"""

import os
import asyncio
import pickle
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
import structlog
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import (
    accuracy_score, f1_score, roc_auc_score, 
    precision_score, recall_score, classification_report,
    confusion_matrix
)
from sklearn.preprocessing import StandardScaler, LabelEncoder
from imblearn.over_sampling import SMOTE
import joblib

from app.core.config import settings

logger = structlog.get_logger()


class ModelManager:
    """
    Manages ML models for horse racing prediction following the paper methodology.
    
    Key Features:
    - SMOTE technique for handling imbalanced data (99.56% balance achieved)
    - Random Forest as primary model (97.6% ROC-AUC)
    - Multiple algorithm support: LR, RF, NB, k-NN
    - 5-fold stratified cross-validation
    - 70-30 train-test split
    """
    
    # Paper-defined attributes (23 attributes including target)
    FEATURE_COLUMNS = [
        'horse_seq', 'age', 'weight', 'allowance', 'draw', 'shoe',
        'sex', 'race_no_id', 'distance', 'race_fav_horse',
        'penetrometer', 'track', 'season', 'club_name', 'horse_id',
        'trainer_id', 'jockey_id', 'color', 'dam', 'sire',
        'owner_id', 'body_weight'
    ]
    
    TARGET_COLUMN = 'position'  # 0 = no win, 1 = win
    
    CATEGORICAL_COLUMNS = [
        'shoe', 'sex', 'track', 'season', 'club_name', 
        'color', 'race_fav_horse'
    ]
    
    NUMERICAL_COLUMNS = [
        'horse_seq', 'age', 'weight', 'allowance', 'draw',
        'distance', 'penetrometer', 'body_weight'
    ]
    
    ID_COLUMNS = [
        'race_no_id', 'horse_id', 'trainer_id', 'jockey_id',
        'dam', 'sire', 'owner_id'
    ]
    
    def __init__(self):
        self.models: Dict[str, Any] = {}
        self.scalers: Dict[str, StandardScaler] = {}
        self.encoders: Dict[str, LabelEncoder] = {}
        self.is_trained: bool = False
        self.training_metrics: Dict[str, Any] = {}
        self.model_version: str = settings.MODEL_VERSION
        
    async def initialize(self):
        """Initialize model manager and load any saved models"""
        logger.info("Initializing Model Manager")
        
        # Initialize models following paper methodology
        self._initialize_models()
        
        # Try to load pre-trained models if available
        await self._load_models()
        
        logger.info("Model Manager initialized", 
                   models_loaded=list(self.models.keys()),
                   is_trained=self.is_trained)
    
    def _initialize_models(self):
        """Initialize all ML models as per paper specifications"""
        
        # Random Forest - Primary model (achieved 97.6% ROC-AUC in paper)
        self.models['random_forest'] = RandomForestClassifier(
            n_estimators=settings.RANDOM_FOREST_N_ESTIMATORS,
            max_depth=None,
            min_samples_split=2,
            min_samples_leaf=1,
            random_state=42,
            n_jobs=-1,
            class_weight='balanced'
        )
        
        # Logistic Regression with Grid Search hyperparameters
        self.models['logistic_regression'] = LogisticRegression(
            max_iter=1000,
            random_state=42,
            solver='lbfgs',
            class_weight='balanced'
        )
        
        # k-Nearest Neighbors (k=5 as per paper)
        self.models['knn'] = KNeighborsClassifier(
            n_neighbors=5,
            weights='distance',
            metric='minkowski'
        )
        
        # Naive Bayes
        self.models['naive_bayes'] = GaussianNB()
        
        # Initialize scaler
        self.scalers['main'] = StandardScaler()
        
        logger.info("Models initialized", 
                   models=list(self.models.keys()))
    
    async def _load_models(self):
        """Load pre-trained models from storage"""
        try:
            model_path = os.path.join(os.path.dirname(__file__), 'saved_models')
            if os.path.exists(model_path):
                # Load Random Forest (primary model)
                rf_path = os.path.join(model_path, 'random_forest.joblib')
                if os.path.exists(rf_path):
                    self.models['random_forest'] = joblib.load(rf_path)
                    self.is_trained = True
                    logger.info("Loaded pre-trained Random Forest model")
                
                # Load scaler
                scaler_path = os.path.join(model_path, 'scaler.joblib')
                if os.path.exists(scaler_path):
                    self.scalers['main'] = joblib.load(scaler_path)
                
                # Load encoders
                encoders_path = os.path.join(model_path, 'encoders.joblib')
                if os.path.exists(encoders_path):
                    self.encoders = joblib.load(encoders_path)
                    
        except Exception as e:
            logger.warning("Could not load pre-trained models", error=str(e))
    
    async def save_models(self):
        """Save trained models to storage"""
        try:
            model_path = os.path.join(os.path.dirname(__file__), 'saved_models')
            os.makedirs(model_path, exist_ok=True)
            
            # Save Random Forest
            rf_path = os.path.join(model_path, 'random_forest.joblib')
            joblib.dump(self.models['random_forest'], rf_path)
            
            # Save scaler
            scaler_path = os.path.join(model_path, 'scaler.joblib')
            joblib.dump(self.scalers['main'], scaler_path)
            
            # Save encoders
            encoders_path = os.path.join(model_path, 'encoders.joblib')
            joblib.dump(self.encoders, encoders_path)
            
            logger.info("Models saved successfully", path=model_path)
            
        except Exception as e:
            logger.error("Failed to save models", error=str(e))
            raise
    
    def preprocess_data(self, df: pd.DataFrame) -> Tuple[np.ndarray, Optional[np.ndarray]]:
        """
        Preprocess data following paper methodology.
        
        Steps:
        1. Handle missing values
        2. Encode categorical variables
        3. Scale numerical features
        4. Return feature matrix and target (if available)
        """
        df = df.copy()
        
        # Handle missing values
        for col in self.NUMERICAL_COLUMNS:
            if col in df.columns:
                df[col] = df[col].fillna(df[col].median())
        
        for col in self.CATEGORICAL_COLUMNS:
            if col in df.columns:
                df[col] = df[col].fillna('unknown')
        
        # Encode categorical variables
        for col in self.CATEGORICAL_COLUMNS:
            if col in df.columns:
                if col not in self.encoders:
                    self.encoders[col] = LabelEncoder()
                    df[col] = self.encoders[col].fit_transform(df[col].astype(str))
                else:
                    # Handle unseen categories
                    df[col] = df[col].astype(str)
                    known_labels = set(self.encoders[col].classes_)
                    df[col] = df[col].apply(
                        lambda x: x if x in known_labels else 'unknown'
                    )
                    if 'unknown' not in self.encoders[col].classes_:
                        self.encoders[col].classes_ = np.append(
                            self.encoders[col].classes_, 'unknown'
                        )
                    df[col] = self.encoders[col].transform(df[col])
        
        # Encode ID columns
        for col in self.ID_COLUMNS:
            if col in df.columns:
                if col not in self.encoders:
                    self.encoders[col] = LabelEncoder()
                    df[col] = self.encoders[col].fit_transform(df[col].astype(str))
                else:
                    df[col] = df[col].astype(str)
                    known_labels = set(self.encoders[col].classes_)
                    df[col] = df[col].apply(
                        lambda x: x if x in known_labels else 'unknown'
                    )
                    if 'unknown' not in self.encoders[col].classes_:
                        self.encoders[col].classes_ = np.append(
                            self.encoders[col].classes_, 'unknown'
                        )
                    df[col] = self.encoders[col].transform(df[col])
        
        # Select features
        feature_cols = [c for c in self.FEATURE_COLUMNS if c in df.columns]
        X = df[feature_cols].values
        
        # Scale features
        if not hasattr(self.scalers['main'], 'mean_'):
            X = self.scalers['main'].fit_transform(X)
        else:
            X = self.scalers['main'].transform(X)
        
        # Get target if available
        y = None
        if self.TARGET_COLUMN in df.columns:
            y = df[self.TARGET_COLUMN].values
        
        return X, y
    
    def apply_smote(self, X: np.ndarray, y: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Apply SMOTE technique as per paper methodology.
        
        The paper achieved near 99.56% balance between classes using SMOTE
        with k=5 neighbors.
        
        Formula: e' = e + rnd(0,1) * |e - ek|
        """
        logger.info("Applying SMOTE", 
                   original_shape=X.shape,
                   class_distribution=dict(zip(*np.unique(y, return_counts=True))))
        
        smote = SMOTE(
            k_neighbors=settings.SMOTE_K_NEIGHBORS,
            random_state=42
        )
        
        X_resampled, y_resampled = smote.fit_resample(X, y)
        
        logger.info("SMOTE applied",
                   resampled_shape=X_resampled.shape,
                   new_class_distribution=dict(zip(*np.unique(y_resampled, return_counts=True))))
        
        return X_resampled, y_resampled
    
    async def train(self, df: pd.DataFrame, apply_smote: bool = True) -> Dict[str, Any]:
        """
        Train models following the paper's methodology exactly.
        
        Steps:
        1. Preprocess data
        2. 70-30 stratified train-test split
        3. Apply SMOTE to training data
        4. Train all models
        5. Evaluate with 5-fold cross-validation
        6. Return comprehensive metrics
        """
        logger.info("Starting model training", 
                   data_shape=df.shape,
                   apply_smote=apply_smote)
        
        # Preprocess
        X, y = self.preprocess_data(df)
        
        if y is None:
            raise ValueError("Target column 'position' not found in data")
        
        # Log class imbalance (paper: 13,179 no-win vs 1,571 win = 11.8%)
        unique, counts = np.unique(y, return_counts=True)
        class_dist = dict(zip(unique, counts))
        minority_ratio = min(counts) / max(counts) * 100
        logger.info("Class distribution", 
                   distribution=class_dist,
                   minority_ratio=f"{minority_ratio:.1f}%")
        
        # 70-30 stratified split as per paper
        X_train, X_test, y_train, y_test = train_test_split(
            X, y,
            test_size=1 - settings.TRAIN_TEST_SPLIT,
            random_state=42,
            stratify=y
        )
        
        # Apply SMOTE to training data only (as per paper)
        if apply_smote:
            X_train_resampled, y_train_resampled = self.apply_smote(X_train, y_train)
        else:
            X_train_resampled, y_train_resampled = X_train, y_train
        
        # Train and evaluate all models
        results = {}
        best_model = None
        best_score = 0
        
        for name, model in self.models.items():
            logger.info(f"Training {name}...")
            
            # Train model
            model.fit(X_train_resampled, y_train_resampled)
            
            # Predictions
            y_pred = model.predict(X_test)
            y_pred_proba = None
            if hasattr(model, 'predict_proba'):
                y_pred_proba = model.predict_proba(X_test)[:, 1]
            
            # Calculate metrics (as per paper: Accuracy, F1, ROC-AUC)
            accuracy = accuracy_score(y_test, y_pred)
            f1 = f1_score(y_test, y_pred)
            
            roc_auc = None
            if y_pred_proba is not None:
                roc_auc = roc_auc_score(y_test, y_pred_proba)
            
            precision = precision_score(y_test, y_pred, zero_division=0)
            recall = recall_score(y_test, y_pred, zero_division=0)
            
            # 5-fold stratified cross-validation (as per paper)
            cv = StratifiedKFold(n_splits=settings.CROSS_VALIDATION_FOLDS, 
                                shuffle=True, random_state=42)
            cv_scores = cross_val_score(model, X_train_resampled, y_train_resampled, 
                                       cv=cv, scoring='accuracy')
            
            # Store results
            results[name] = {
                'accuracy': float(accuracy),
                'f1_score': float(f1),
                'roc_auc': float(roc_auc) if roc_auc else None,
                'precision': float(precision),
                'recall': float(recall),
                'cv_mean': float(cv_scores.mean()),
                'cv_std': float(cv_scores.std()),
                'confusion_matrix': confusion_matrix(y_test, y_pred).tolist()
            }
            
            # Track best model (by ROC-AUC, as paper emphasizes)
            score = roc_auc if roc_auc else accuracy
            if score > best_score:
                best_score = score
                best_model = name
            
            logger.info(f"Model {name} trained",
                       accuracy=f"{accuracy:.3f}",
                       f1=f"{f1:.3f}",
                       roc_auc=f"{roc_auc:.3f}" if roc_auc else "N/A",
                       cv_mean=f"{cv_scores.mean():.3f}")
        
        # Mark as trained
        self.is_trained = True
        self.training_metrics = {
            'timestamp': datetime.utcnow().isoformat(),
            'data_shape': df.shape,
            'smote_applied': apply_smote,
            'best_model': best_model,
            'best_score': float(best_score),
            'results': results
        }
        
        # Save models
        await self.save_models()
        
        logger.info("Training complete",
                   best_model=best_model,
                   best_score=f"{best_score:.3f}")
        
        return self.training_metrics
    
    async def predict(self, df: pd.DataFrame, model_name: str = 'random_forest') -> Dict[str, Any]:
        """
        Make predictions using the specified model.
        
        Args:
            df: DataFrame with horse racing features
            model_name: Name of model to use (default: random_forest - best performer)
        
        Returns:
            Dictionary with predictions, probabilities, and metadata
        """
        if not self.is_trained:
            raise ValueError("Models not trained. Please train first.")
        
        if model_name not in self.models:
            raise ValueError(f"Unknown model: {model_name}")
        
        # Preprocess
        X, _ = self.preprocess_data(df)
        
        # Get model
        model = self.models[model_name]
        
        # Predict
        predictions = model.predict(X)
        
        # Get probabilities if available
        probabilities = None
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(X)[:, 1]
        
        # Build response
        result = {
            'model': model_name,
            'model_version': self.model_version,
            'timestamp': datetime.utcnow().isoformat(),
            'num_predictions': len(predictions),
            'predictions': predictions.tolist(),
            'win_probabilities': probabilities.tolist() if probabilities is not None else None
        }
        
        return result
    
    async def predict_race(self, race_data: List[Dict]) -> Dict[str, Any]:
        """
        Predict winner for a specific race given all runners.
        
        Args:
            race_data: List of dictionaries, each containing a horse's features
        
        Returns:
            Ranked predictions with confidence scores
        """
        if not self.is_trained:
            raise ValueError("Models not trained. Please train first.")
        
        df = pd.DataFrame(race_data)
        
        # Get predictions from primary model (Random Forest)
        model = self.models['random_forest']
        X, _ = self.preprocess_data(df)
        
        probabilities = model.predict_proba(X)[:, 1]
        
        # Rank by win probability
        rankings = []
        for i, (prob, row) in enumerate(zip(probabilities, race_data)):
            rankings.append({
                'rank': 0,  # Will be set after sorting
                'horse_id': row.get('horse_id'),
                'horse_seq': row.get('horse_seq'),
                'win_probability': float(prob),
                'confidence': self._calculate_confidence(prob)
            })
        
        # Sort by probability (descending)
        rankings.sort(key=lambda x: x['win_probability'], reverse=True)
        
        # Assign ranks
        for i, r in enumerate(rankings):
            r['rank'] = i + 1
        
        return {
            'race_id': race_data[0].get('race_no_id') if race_data else None,
            'timestamp': datetime.utcnow().isoformat(),
            'model': 'random_forest',
            'model_version': self.model_version,
            'num_runners': len(rankings),
            'rankings': rankings,
            'predicted_winner': rankings[0] if rankings else None
        }
    
    def _calculate_confidence(self, probability: float) -> str:
        """Calculate confidence level from probability"""
        if probability >= 0.8:
            return 'very_high'
        elif probability >= 0.65:
            return 'high'
        elif probability >= 0.5:
            return 'medium'
        elif probability >= 0.35:
            return 'low'
        else:
            return 'very_low'
    
    def get_feature_importance(self, model_name: str = 'random_forest') -> Dict[str, float]:
        """Get feature importance from trained model"""
        if not self.is_trained:
            return {}
        
        model = self.models.get(model_name)
        if model is None:
            return {}
        
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
            feature_cols = [c for c in self.FEATURE_COLUMNS if c in self.FEATURE_COLUMNS]
            return dict(zip(feature_cols[:len(importances)], importances.tolist()))
        
        return {}
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about loaded models"""
        return {
            'models': list(self.models.keys()),
            'is_trained': self.is_trained,
            'model_version': self.model_version,
            'training_metrics': self.training_metrics,
            'feature_columns': self.FEATURE_COLUMNS,
            'target_column': self.TARGET_COLUMN
        }
    
    async def shutdown(self):
        """Cleanup on shutdown"""
        logger.info("Model Manager shutting down")
        if self.is_trained:
            await self.save_models()

# CHIMERA v4 - Technical Documentation
## Multi-Agent AI Horse Racing Prediction Platform
### Copyright 2026 Ascot Wealth Management

---

## Executive Summary

CHIMERA v4 is a pre-runner implementation of a sophisticated multi-agent AI horse racing prediction platform. This implementation focuses on the ML methodology from the research paper "Predicting Outcomes of Horse Racing using Machine Learning" which achieved **97.6% ROC-AUC** using Random Forest with SMOTE oversampling.

---

## Tech Stack

### Backend
| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | FastAPI 0.109 | High-performance async API |
| Language | Python 3.11 | ML/Data processing |
| ML Core | scikit-learn 1.4 | Model training & inference |
| Imbalanced Data | imbalanced-learn 0.11 | SMOTE implementation |
| Data Processing | pandas 2.1, numpy 1.26 | Data manipulation |
| Cloud Storage | google-cloud-storage | Persistent storage |
| BigQuery | google-cloud-bigquery | Data warehouse |
| Containerization | Docker | Deployment packaging |
| Hosting | Google Cloud Run | Serverless containers |

### Frontend
| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | React 18.2 | UI components |
| Build Tool | Vite 5.0 | Fast development/build |
| Routing | react-router-dom 6.21 | SPA navigation |
| State | Zustand 4.4 + Context | State management |
| Animation | framer-motion 10.17 | UI animations |
| HTTP Client | axios 1.6 | API communication |
| Charts | recharts 2.10 | Data visualization |
| Icons | lucide-react 0.303 | Icon library |
| Hosting | Cloudflare Pages | Edge deployment |

### Infrastructure
| Service | Provider | Purpose |
|---------|----------|---------|
| Backend Hosting | Google Cloud Run | Serverless containers |
| Frontend Hosting | Cloudflare Pages | Edge CDN |
| Data Storage | Google Cloud Storage | File/model storage |
| Data Warehouse | Google BigQuery | Training data |
| CI/CD | GitHub Actions | Automated deployment |
| Domain | Custom (thync.online) | Frontend access |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CHIMERA v4                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────────────────────────────┐  │
│  │   Frontend   │    │              Backend                  │  │
│  │  (React/CF)  │───▶│           (FastAPI/GCR)              │  │
│  └──────────────┘    │                                       │  │
│                      │  ┌─────────────────────────────────┐ │  │
│                      │  │      CONDUCTOR AI (Master)      │ │  │
│                      │  │                                  │ │  │
│                      │  │  ┌──────┐ ┌──────┐ ┌──────┐    │ │  │
│                      │  │  │ Data │ │Model │ │Analy │    │ │  │
│                      │  │  │Agent │ │Agent │ │Agent │    │ │  │
│                      │  │  └──────┘ └──────┘ └──────┘    │ │  │
│                      │  │  ┌──────┐ ┌──────┐             │ │  │
│                      │  │  │ Back │ │Monit │             │ │  │
│                      │  │  │ test │ │ or   │             │ │  │
│                      │  │  └──────┘ └──────┘             │ │  │
│                      │  └─────────────────────────────────┘ │  │
│                      │                                       │  │
│                      │  ┌─────────────────────────────────┐ │  │
│                      │  │       MODEL MANAGER              │ │  │
│                      │  │  • Random Forest (Primary)       │ │  │
│                      │  │  • Logistic Regression           │ │  │
│                      │  │  • k-NN (k=5)                    │ │  │
│                      │  │  • Naive Bayes                   │ │  │
│                      │  │  • SMOTE Oversampling            │ │  │
│                      │  └─────────────────────────────────┘ │  │
│                      └──────────────────────────────────────┘  │
│                                        │                        │
│                      ┌─────────────────┼─────────────────┐     │
│                      ▼                 ▼                 ▼     │
│              ┌───────────┐    ┌───────────┐    ┌───────────┐  │
│              │   GCS     │    │ BigQuery  │    │   GCS     │  │
│              │  Models   │    │   Data    │    │   Logs    │  │
│              └───────────┘    └───────────┘    └───────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### Health & Status
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/health` | GET | Basic health check |
| `/api/v1/health/ready` | GET | Readiness probe |
| `/api/v1/health/live` | GET | Liveness probe |
| `/api/v1/health/system` | GET | Detailed system status |

### Models
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/models` | GET | List all models |
| `/api/v1/models/{name}/info` | GET | Model details |
| `/api/v1/models/{name}/feature-importance` | GET | Feature importance |
| `/api/v1/models/comparison` | GET | Compare all models |

### Training
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/training/train` | POST | Train from JSON data |
| `/api/v1/training/train/upload` | POST | Train from CSV upload |
| `/api/v1/training/status` | GET | Training status |

### Predictions
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/predictions/race` | POST | Predict race winner |
| `/api/v1/predictions/batch` | POST | Batch predictions |
| `/api/v1/predictions/models` | GET | Available models |

### Analysis
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/analysis/eda` | POST | Exploratory analysis |
| `/api/v1/analysis/features` | POST | Feature analysis |
| `/api/v1/analysis/correlation` | POST | Correlation analysis |
| `/api/v1/analysis/upload` | POST | Analyze from file |

### Backtest
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/backtest/run` | POST | Run backtest |
| `/api/v1/backtest/upload` | POST | Backtest from file |
| `/api/v1/backtest/strategies` | GET | Preset strategies |

### Agents
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/agents` | GET | List all agents |
| `/api/v1/agents/{name}` | GET | Agent status |
| `/api/v1/agents/task` | POST | Execute agent task |
| `/api/v1/agents/conductor/status` | GET | Conductor status |

### Data (Framework)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/data/sources` | GET | List data sources |
| `/api/v1/data/sources` | POST | Add data source |
| `/api/v1/data/bigquery/schema` | GET | BigQuery schema |
| `/api/v1/data/upload` | POST | Upload data file |

---

## Environment Variables

### Backend (Cloud Run)
| Variable | Description | Example |
|----------|-------------|---------|
| `GCP_PROJECT_ID` | Google Cloud project | `chimera-v4` |
| `GCS_BUCKET_NAME` | Storage bucket | `chimera-v4-data` |
| `ENVIRONMENT` | Runtime environment | `production` |
| `DEBUG` | Debug mode | `false` |
| `LOG_LEVEL` | Logging level | `INFO` |

### Frontend (Cloudflare)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `https://chimera-v4-...run.app` |

### GitHub Secrets
| Secret | Description |
|--------|-------------|
| `GCP_SA_KEY` | GCP service account JSON |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |

---

## BigQuery Schema

### Dataset: `horse_racing`

#### Table: `training_data`
Based on paper's 23-attribute schema:

| Column | Type | Description |
|--------|------|-------------|
| `position` | INTEGER | Target: 0=loss, 1=win |
| `horse_seq` | INTEGER | Horse sequence in race |
| `age` | FLOAT | Horse age |
| `weight` | FLOAT | Jockey weight (kg) |
| `allowance` | FLOAT | Weight allowance |
| `draw` | INTEGER | Starting stall number |
| `shoe` | STRING | A=Aluminium, S=Steel |
| `sex` | STRING | Horse sex |
| `race_no_id` | STRING | Race identifier |
| `distance` | FLOAT | Race distance (metres) |
| `race_fav_horse` | STRING | Favorite horse ID |
| `penetrometer` | FLOAT | Track condition value |
| `track` | STRING | Going condition |
| `season` | STRING | Monsoon/Regular/Winter |
| `club_name` | STRING | Racing club |
| `horse_id` | STRING | Horse identifier |
| `trainer_id` | STRING | Trainer identifier |
| `jockey_id` | STRING | Jockey identifier |
| `color` | STRING | Horse color |
| `dam` | STRING | Horse mother |
| `sire` | STRING | Horse father |
| `owner_id` | STRING | Owner identifier |
| `body_weight` | FLOAT | Horse weight (kg) |

#### Table: `races`
Race metadata and results.

#### Table: `predictions`
Model predictions for audit trail.

---

## ML Methodology

### Based on Research Paper
"Predicting Outcomes of Horse Racing using Machine Learning"
- **Dataset**: 14,750 races, 23 attributes
- **Class Imbalance**: 11.8% minority class (winners)
- **Solution**: SMOTE with k=5 neighbors
- **Best Model**: Random Forest with 97.6% ROC-AUC

### Implementation Details

1. **Data Preprocessing**
   - Handle missing values (median for numeric, 'unknown' for categorical)
   - Label encoding for categorical variables
   - Standard scaling for numerical features

2. **SMOTE Application**
   - Applied only to training data (70%)
   - Achieves 99.56% class balance
   - Formula: `e' = e + rnd(0,1) * |e - ek|`

3. **Model Training**
   - 70-30 stratified train-test split
   - 5-fold stratified cross-validation
   - Four algorithms: RF, LR, k-NN, NB

4. **Evaluation Metrics**
   - Accuracy
   - F1 Score
   - ROC-AUC (primary)
   - Precision/Recall

---

## Deployment

### Backend Deployment
```bash
# Build and push Docker image
cd backend
docker build -t gcr.io/chimera-v4/chimera-v4:latest .
docker push gcr.io/chimera-v4/chimera-v4:latest

# Deploy to Cloud Run
gcloud run deploy chimera-v4 \
  --image gcr.io/chimera-v4/chimera-v4:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Frontend Deployment
```bash
cd frontend
npm install
npm run build
# Deployed via GitHub Actions to Cloudflare Pages
```

---

## Data Lake Requirements

### Storage Volumes (Estimated)
| Data Type | Size | Retention |
|-----------|------|-----------|
| Raw Betfair Data | ~50GB/year | 5 years |
| Processed Features | ~10GB/year | 5 years |
| Model Artifacts | ~500MB | Latest + 5 versions |
| Predictions Log | ~1GB/year | 3 years |
| Training Datasets | ~5GB | Latest + archived |

### Google Cloud Storage Buckets
| Bucket | Purpose | Class |
|--------|---------|-------|
| `chimera-v4-data` | Raw/processed data | Standard |
| `chimera-v4-models` | Model artifacts | Standard |
| `chimera-v4-archive` | Historical data | Nearline |

---

## Next Steps

1. **Connect Data Sources**
   - Integrate Betfair Historical Data API
   - Connect Racing API feeds
   - Set up BigQuery data pipeline

2. **Enhance ML Pipeline**
   - Add more feature engineering
   - Implement automated retraining
   - Add model monitoring

3. **Production Hardening**
   - Add authentication
   - Implement rate limiting
   - Set up monitoring/alerting

---

## Support

**Repository**: github.com/charles-ascot/chimera-v4
**Copyright**: 2026 Ascot Wealth Management
**Version**: 4.0.0

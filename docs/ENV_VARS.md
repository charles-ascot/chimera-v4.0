# Environment Variables

## Frontend (Cloudflare Pages)

| Variable | Required | Example | Notes |
|---|---:|---|---|
| `VITE_API_BASE_URL` | ✅ | `https://<backend-url>` | Set after Cloud Run deploy. Local dev: `http://localhost:8080` |

## Backend (Cloud Run)

| Variable | Required | Example | Notes |
|---|---:|---|---|
| `DATASET_URI` | ✅ | `gs://<bucket>/datasets/runner_table.parquet` | Paper dataset (numeric). CSV/parquet supported. |
| `TARGET_COLUMN` | ✅ | `position` | Binary label (0/1). |
| `GCS_BUCKET` | ✅ | `chimera-artifacts` | Artifact bucket (models, meta). |
| `ARTIFACT_PREFIX` | ✅ | `chimera/artifacts` | Key prefix. |
| `CV_SPLITS` | ❌ | `5` | Default 5. |
| `SMOTE_K_NEIGHBORS` | ❌ | `5` | Default 5. |
| `RANDOM_SEED` | ❌ | `42` | Default 42. |
| `FEATURE_COLUMNS_CSV` | ❌ | `age,weight,draw,...` | Optional; otherwise uses all non-target columns. |

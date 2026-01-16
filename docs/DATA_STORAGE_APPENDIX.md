# Data Storage Appendix (Concise)

This pre-runner assumes the **paper dataset already exists** and is provided as a single file.

## Buckets

| Bucket purpose | Recommended location | Contents | Typical size/notes |
|---|---|---|---|
| Dataset bucket | `gs://<bucket>/datasets/` | `runner_table.csv` or `runner_table.parquet` | Parquet strongly recommended for speed/cost |
| Artifact bucket | `gs://<bucket>/chimera/artifacts/` | trained model (`joblib`) + metadata JSON; also `/latest/...` pointers | small (< 100MB) per model in most cases |

## Objects written by backend

| Object | Path | Notes |
|---|---|---|
| Latest model | `chimera/artifacts/latest/model.joblib` | overwritten on each `/train` |
| Latest meta | `chimera/artifacts/latest/meta.json` | overwritten on each `/train` |
| Versioned model | `chimera/artifacts/model/<trained_at>_<key>.joblib` | immutable |
| Versioned meta | `chimera/artifacts/meta/<trained_at>_<key>.json` | immutable |

## Cloud Run ephemeral storage
- `/tmp` only; ephemeral and wiped between instances. Do not rely on it for persistence.

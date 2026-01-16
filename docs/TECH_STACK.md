# Tech Stack Summary

## Frontend (Cloudflare Pages)
- React 18 + Vite 5 (TypeScript)
- Recharts (visualisation)
- React Query (data fetching + caching)
- **Styling:** exact `main.css` supplied by Charles (global import)

## Backend (Google Cloud Run)
- Python 3.11
- FastAPI
- scikit-learn + imbalanced-learn (SMOTE)
- google-cloud-storage (artifact persistence)

## CI/CD
- GitHub Actions
  - Frontend: Cloudflare Pages deploy
  - Backend: Build Docker image, push to Artifact Registry, deploy to Cloud Run

## ML Pipeline (Paper Method)
- Numeric runner table (22 features + binary `position`)
- Stratified 5-fold cross-validation
- SMOTE(k=5) applied **inside fold**
- Models: LR, KNN, Gaussian NB, Random Forest
- Metrics: Accuracy, F1, ROC-AUC + ROC curve (out-of-fold)

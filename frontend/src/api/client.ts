import { API_BASE_URL } from "../env";

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {})
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export type DatasetSummary = {
  rows: number;
  columns: number;
  target_column: string;
  positive_rate: number;
  feature_columns: string[];
};

export type ModelMetrics = {
  model_key: string;
  accuracy_mean: number;
  accuracy_std: number;
  f1_mean: number;
  f1_std: number;
  roc_auc_mean: number;
  roc_auc_std: number;
};

export type RocCurve = { fpr: number[]; tpr: number[]; thresholds: number[] };

export type MetricsResponse = {
  best_model: string;
  metrics: ModelMetrics[];
  roc?: RocCurve | null;
  trained_at: string;
};

export type TrainResponse = MetricsResponse & { artifact_uri: string };

export async function fetchDatasetSummary() {
  return request<DatasetSummary>("/api/dataset/summary");
}

export async function train(models: string[]) {
  return request<TrainResponse>("/api/train", {
    method: "POST",
    body: JSON.stringify({ models })
  });
}

export async function fetchMetrics() {
  return request<MetricsResponse>("/api/metrics");
}

export async function predict(features: Record<string, unknown>) {
  return request<{ probability: number; threshold: number }>("/api/predict", {
    method: "POST",
    body: JSON.stringify({ features })
  });
}

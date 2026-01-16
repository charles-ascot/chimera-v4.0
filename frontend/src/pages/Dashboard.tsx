import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

import { fetchDatasetSummary, train, TrainResponse } from "../api/client";
import RocCurveChart from "../components/charts/RocCurveChart";
import MetricsBarChart from "../components/charts/MetricsBarChart";

const MODEL_OPTIONS = [
  { key: "lr", label: "Logistic Regression" },
  { key: "knn", label: "KNN (k=5)" },
  { key: "nb", label: "Naive Bayes" },
  { key: "rf", label: "Random Forest" }
];

export default function Dashboard() {
  const summaryQ = useQuery({ queryKey: ["datasetSummary"], queryFn: fetchDatasetSummary });
  const [selected, setSelected] = useState<string[]>(["lr", "knn", "nb", "rf"]);

  const trainM = useMutation({
    mutationFn: () => train(selected),
  });

  const metrics = trainM.data;

  const posRate = summaryQ.data?.positive_rate;
  const posText = posRate != null ? `${(posRate * 100).toFixed(2)}%` : "—";

  function toggle(key: string) {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-left">
          <div className="header-title">CHIMERA IV • Paper-Method Pre-Runner</div>
          <div className="header-subtitle">SMOTE(k=5) • Stratified 5-Fold CV • RF/LR/KNN/NB</div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link className="button-location" to="/dataset">Dataset</Link>
          <Link className="button-location" to="/evaluate">Evaluate</Link>
          <Link className="button-location" to="/predict">Predict</Link>
          <Link className="button-location" to="/docs">Docs</Link>
          <button
            className="button-location"
            onClick={() => {
              localStorage.removeItem("chimera_auth");
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="content">
        <div className="main-container">
          <div className="glass-panel control-panel">
            <div className="panel-title">Control Panel</div>

            <div className="preset-values">
              <div className="preset-item">
                <span className="preset-label">Rows</span>
                <span className="preset-value">{summaryQ.data?.rows ?? "—"}</span>
              </div>
              <div className="preset-item">
                <span className="preset-label">Columns</span>
                <span className="preset-value">{summaryQ.data?.columns ?? "—"}</span>
              </div>
              <div className="preset-item">
                <span className="preset-label">Positive rate (winners)</span>
                <span className="preset-value">{posText}</span>
              </div>
            </div>

            <div className="tier-section">
              <div className="date-label">Models</div>
              <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                {MODEL_OPTIONS.map((m) => (
                  <label
                    key={m.key}
                    style={{ display: "flex", gap: 10, alignItems: "center" }}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(m.key)}
                      onChange={() => toggle(m.key)}
                    />
                    <span style={{ fontSize: 13 }}>{m.label}</span>
                  </label>
                ))}
              </div>
              <div className="tier-description">
                Training uses SMOTE(k=5) **inside each fold** and reports mean±std.
              </div>
            </div>

            <button
              className="button-check"
              disabled={trainM.isPending || selected.length === 0}
              onClick={() => trainM.mutate()}
            >
              {trainM.isPending ? "Training & Evaluating…" : "Run Training"}
            </button>

            {trainM.isError ? (
              <div className="batch-warning" style={{ marginTop: 14 }}>
                {(trainM.error as Error).message}
              </div>
            ) : null}

            {trainM.data?.artifact_uri ? (
              <div className="path-display" style={{ marginTop: 16 }}>
                <div className="path-label">Artifact</div>
                <div className="path-value">{trainM.data.artifact_uri}</div>
              </div>
            ) : null}
          </div>

          <div className="glass-panel results-panel">
            <div className="panel-title">Results</div>

            <div className="results-grid">
              <div className="result-card">
                <div className="result-icon">🏆</div>
                <div className="result-value">{metrics?.best_model?.toUpperCase() ?? "—"}</div>
                <div className="result-label">Best Model (ROC-AUC)</div>
              </div>

              <div className="result-card">
                <div className="result-icon">🕒</div>
                <div className="result-value">
                  {metrics?.trained_at ? new Date(metrics.trained_at).toLocaleString() : "—"}
                </div>
                <div className="result-label">Trained At</div>
              </div>
            </div>

            <div style={{ display: "grid", gap: 18 }}>
              <MetricsBarChart metrics={metrics?.metrics ?? []} />
              <RocCurveChart roc={metrics?.roc ?? null} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

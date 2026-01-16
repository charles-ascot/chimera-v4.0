import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { fetchMetrics } from "../api/client";
import MetricsBarChart from "../components/charts/MetricsBarChart";
import RocCurveChart from "../components/charts/RocCurveChart";

export default function Evaluate() {
  const q = useQuery({ queryKey: ["metrics"], queryFn: fetchMetrics, retry: false });

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-left">
          <div className="header-title">Evaluation</div>
          <div className="header-subtitle">Latest trained model metrics (from artifact store)</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link className="button-location" to="/">Back</Link>
        </div>
      </header>

      <div className="content">
        <div className="main-container" style={{ gridTemplateColumns: "1fr" }}>
          <div className="glass-panel">
            <div className="panel-title">Metrics</div>

            {q.isError ? (
              <div className="batch-warning">
                {(q.error as Error).message || "No trained model found. Run training from dashboard."}
              </div>
            ) : null}

            <div className="results-grid">
              <div className="result-card">
                <div className="result-icon">🏆</div>
                <div className="result-value">{q.data?.best_model?.toUpperCase() ?? "—"}</div>
                <div className="result-label">Best Model</div>
              </div>
              <div className="result-card">
                <div className="result-icon">🕒</div>
                <div className="result-value">
                  {q.data?.trained_at ? new Date(q.data.trained_at).toLocaleString() : "—"}
                </div>
                <div className="result-label">Trained At</div>
              </div>
            </div>

            <div style={{ display: "grid", gap: 18 }}>
              <MetricsBarChart metrics={q.data?.metrics ?? []} />
              <RocCurveChart roc={q.data?.roc ?? null} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

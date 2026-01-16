import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { fetchDatasetSummary } from "../api/client";

export default function Dataset() {
  const q = useQuery({ queryKey: ["datasetSummary"], queryFn: fetchDatasetSummary });

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-left">
          <div className="header-title">Dataset Summary</div>
          <div className="header-subtitle">Paper-style runner table (22 features + binary label)</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link className="button-location" to="/">Back</Link>
        </div>
      </header>

      <div className="content">
        <div className="main-container" style={{ gridTemplateColumns: "1fr" }}>
          <div className="glass-panel">
            <div className="panel-title">Overview</div>

            {q.isError ? (
              <div className="batch-warning">{(q.error as Error).message}</div>
            ) : null}

            <div className="download-stats">
              <h3>Stats</h3>
              <div className="stats-row"><span>Rows</span><span>{q.data?.rows ?? "—"}</span></div>
              <div className="stats-row"><span>Columns</span><span>{q.data?.columns ?? "—"}</span></div>
              <div className="stats-row"><span>Target</span><span>{q.data?.target_column ?? "—"}</span></div>
              <div className="stats-row"><span>Positive rate</span><span>{q.data ? `${(q.data.positive_rate * 100).toFixed(2)}%` : "—"}</span></div>
            </div>

            <div className="download-stats" style={{ marginTop: 16 }}>
              <h3>Feature Columns</h3>
              <div style={{ display: "grid", gap: 8 }}>
                {(q.data?.feature_columns ?? []).map((c) => (
                  <div key={c} className="path-display">
                    <div className="path-label">col</div>
                    <div className="path-value">{c}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

import { fetchDatasetSummary, predict } from "../api/client";

export default function Predict() {
  const summaryQ = useQuery({ queryKey: ["datasetSummary"], queryFn: fetchDatasetSummary });
  const [jsonText, setJsonText] = useState("{}");

  const mutation = useMutation({ mutationFn: async () => {
    const payload = JSON.parse(jsonText);
    return predict(payload);
  }});

  const featureTemplate = useMemo(() => {
    const cols = summaryQ.data?.feature_columns ?? [];
    // create a small template with zeros
    const obj: Record<string, number> = {};
    cols.slice(0, 12).forEach((c) => (obj[c] = 0));
    return JSON.stringify(obj, null, 2);
  }, [summaryQ.data]);

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-left">
          <div className="header-title">Predict</div>
          <div className="header-subtitle">Score a single runner row (features → win probability)</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link className="button-location" to="/">Back</Link>
        </div>
      </header>

      <div className="content">
        <div className="main-container" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="glass-panel control-panel">
            <div className="panel-title">Input Features (JSON)</div>

            <textarea
              className="form-input"
              style={{ minHeight: 320, fontFamily: "Courier New, monospace" }}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
            />

            <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
              <button
                className="button-location"
                type="button"
                onClick={() => setJsonText(featureTemplate)}
              >
                Paste Template
              </button>
              <button
                className="button-check"
                type="button"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                {mutation.isPending ? "Scoring…" : "Predict"}
              </button>
            </div>

            {mutation.isError ? (
              <div className="batch-warning" style={{ marginTop: 14 }}>
                {(mutation.error as Error).message}
              </div>
            ) : null}
          </div>

          <div className="glass-panel results-panel">
            <div className="panel-title">Output</div>

            <div className="results-grid">
              <div className="result-card">
                <div className="result-icon">🎯</div>
                <div className="result-value">
                  {mutation.data ? `${(mutation.data.probability * 100).toFixed(2)}%` : "—"}
                </div>
                <div className="result-label">Win Probability</div>
              </div>
              <div className="result-card">
                <div className="result-icon">⚖️</div>
                <div className="result-value">
                  {mutation.data ? mutation.data.threshold.toFixed(2) : "—"}
                </div>
                <div className="result-label">Threshold</div>
              </div>
            </div>

            <div className="download-stats">
              <h3>Notes</h3>
              <div className="stats-row">
                <span>Missing features</span>
                <span>Defaulted to 0.0 on backend</span>
              </div>
              <div className="stats-row">
                <span>Feature contract</span>
                <span>From /dataset/summary</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

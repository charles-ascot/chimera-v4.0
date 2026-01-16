import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import type { ModelMetrics } from "../../api/client";

export default function MetricsBarChart({ metrics }: { metrics: ModelMetrics[] }) {
  const data = useMemo(() => metrics.map((m) => ({
    model: m.model_key.toUpperCase(),
    accuracy: m.accuracy_mean,
    f1: m.f1_mean,
    roc_auc: m.roc_auc_mean
  })), [metrics]);

  if (!metrics.length) {
    return (
      <div className="download-stats">
        <h3>Metrics</h3>
        <div className="stats-row"><span>Status</span><span>Run training to populate metrics</span></div>
      </div>
    );
  }

  return (
    <div className="download-stats">
      <h3>Cross-Validation Metrics (mean)</h3>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="model" />
            <YAxis domain={[0, 1]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="accuracy" />
            <Bar dataKey="f1" />
            <Bar dataKey="roc_auc" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

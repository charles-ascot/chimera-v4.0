import React, { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import type { RocCurve } from "../../api/client";

export default function RocCurveChart({ roc }: { roc: RocCurve | null }) {
  const data = useMemo(() => {
    if (!roc) return [];
    return roc.fpr.map((fpr, i) => ({ fpr, tpr: roc.tpr[i] }));
  }, [roc]);

  if (!roc) {
    return (
      <div className="download-stats">
        <h3>ROC Curve</h3>
        <div className="stats-row"><span>Status</span><span>Run training to generate ROC curve</span></div>
      </div>
    );
  }

  return (
    <div className="download-stats">
      <h3>ROC Curve (OOF)</h3>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fpr" type="number" domain={[0, 1]} />
            <YAxis type="number" domain={[0, 1]} />
            <Tooltip />
            <Legend />
            <Line dataKey="tpr" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

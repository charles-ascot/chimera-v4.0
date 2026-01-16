import React from "react";
import { Link } from "react-router-dom";

export default function Docs() {
  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-left">
          <div className="header-title">Documentation</div>
          <div className="header-subtitle">Build, environment variables, endpoints</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link className="button-location" to="/">Back</Link>
        </div>
      </header>

      <div className="content">
        <div className="main-container" style={{ gridTemplateColumns: "1fr" }}>
          <div className="glass-panel">
            <div className="panel-title">Repo docs</div>

            <div className="download-stats">
              <h3>Files</h3>
              <div className="stats-row"><span>Tech stack</span><span>docs/TECH_STACK.md</span></div>
              <div className="stats-row"><span>Endpoints</span><span>docs/ENDPOINTS.md</span></div>
              <div className="stats-row"><span>Env vars</span><span>docs/ENV_VARS.md</span></div>
              <div className="stats-row"><span>Storage appendix</span><span>docs/DATA_STORAGE_APPENDIX.md</span></div>
            </div>

            <div className="batch-warning" style={{ marginTop: 16 }}>
              Note: Cloudflare Pages can’t read your repo markdown at runtime. These are for developers.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

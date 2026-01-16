import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Stub auth: any non-empty email/password
    setTimeout(() => {
      localStorage.setItem("chimera_auth", "1");
      setLoading(false);
      nav("/");
    }, 500);
  }

  return (
    <div className="login-screen">
      <div className="glass-panel login-panel">
        <div className="logo-section">
          <div className="app-title">CHIMERA IV</div>
          <div className="app-subtitle">MODEL PRE-RUNNER • PAPER PIPELINE</div>
        </div>

        <div className="separator" />

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@ascot.co.za"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="button-primary" disabled={loading} type="submit">
            {loading ? "Authenticating…" : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}

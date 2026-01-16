import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Dataset from "./pages/Dataset";
import Evaluate from "./pages/Evaluate";
import Predict from "./pages/Predict";
import Docs from "./pages/Docs";

function isAuthed() {
  return localStorage.getItem("chimera_auth") === "1";
}

function Protected({ children }: { children: React.ReactNode }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const [showIntro, setShowIntro] = React.useState(() => {
    // Show the intro once per browser (until user clears storage).
    return localStorage.getItem("chimera_intro_seen") !== "1";
  });

  React.useEffect(() => {
    if (!showIntro) return;

    // Fallback: if autoplay is blocked, continue after a short delay.
    const t = window.setTimeout(() => {
      localStorage.setItem("chimera_intro_seen", "1");
      setShowIntro(false);
    }, 8000);

    return () => window.clearTimeout(t);
  }, [showIntro]);

  const dismissIntro = React.useCallback(() => {
    localStorage.setItem("chimera_intro_seen", "1");
    setShowIntro(false);
  }, []);

  return (
    <div className="app">
      {showIntro && (
        <div className="intro-screen" onClick={dismissIntro} role="button" tabIndex={0}>
          <video
            className="intro-video"
            src="/static/assets/videos/chimera1-bg.mp4"
            autoPlay
            muted
            playsInline
            onEnded={dismissIntro}
            onError={dismissIntro}
          />
        </div>
      )}

      <div className="image-bg" />
      <div className="login-overlay" />

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />

        <Route
          path="/dataset"
          element={
            <Protected>
              <Dataset />
            </Protected>
          }
        />

        <Route
          path="/evaluate"
          element={
            <Protected>
              <Evaluate />
            </Protected>
          }
        />

        <Route
          path="/predict"
          element={
            <Protected>
              <Predict />
            </Protected>
          }
        />

        <Route
          path="/docs"
          element={
            <Protected>
              <Docs />
            </Protected>
          }
        />

        <Route path="*" element={<Navigate to={isAuthed() ? "/" : "/login"} replace />} />
      </Routes>
    </div>
  );
}

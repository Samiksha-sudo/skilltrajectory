"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TestStartPage() {
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<any>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/tests/active");
        if (!res.ok) {
          window.location.href = "/login";
          return;
        }
        const data = await res.json();
        setTest(data.test);
      } catch {
        setMsg("Failed to load active test.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function start() {
    setMsg(null);
    const res = await fetch("/api/attempts/start", { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setMsg(data?.message || "Failed to start test.");
      return;
    }

    window.location.href = `/test/${data.attemptId}`;
  }

  return (
    <div className="apti-bg">

      <main style={{ maxWidth: 900, margin: "0 auto", padding: 28 }}>
        <div className="focus-card" style={{ padding: 22 }}>
          <h1 style={{ margin: 0, color: "white" }}>Start Aptitude Test</h1>
          <p style={{ marginTop: 10, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
            This is a timed assessment. Once you start, the timer begins immediately.
          </p>

          {loading ? (
            <p style={{ color: "rgba(255,255,255,0.7)" }}>Loading test…</p>
          ) : test ? (
            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <div className="glass" style={{ padding: 14 }}>
                <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>Test</div>
                <div style={{ color: "rgba(255,255,255,0.92)", fontWeight: 600 }}>{test.name}</div>
                <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 6 }}>
                  Duration: {test.duration_minutes} minutes
                </div>
              </div>

              <button
                className="btn-dashboard"
                onClick={start}
                style={{ justifyContent: "center" }}
              >
                Start Test
              </button>

              {msg && (
                <div className="glass" style={{ padding: 12, borderColor: "rgba(239,68,68,0.35)", color: "rgba(239,68,68,0.95)" }}>
                  {msg}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Link href="/dashboard" className="btn-dashboard">← Back to Dashboard</Link>
                <Link href="/profile/setup" style={{ color: "rgba(255,255,255,0.75)" }}>Edit Profile</Link>
              </div>
            </div>
          ) : (
            <div className="glass" style={{ padding: 12, color: "rgba(255,255,255,0.7)" }}>
              No active test found. Please add a test in DB.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function StudyTimePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [minutes, setMinutes] = useState<string>("60");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
          window.location.href = "/login";
          return;
        }

        const data = await res.json();
        const m = data?.profile?.daily_study_minutes;

        if (m !== null && m !== undefined) setMinutes(String(m));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const m = Number(minutes);

    // AC: validation
    if (!Number.isInteger(m)) {
      setMsg({ type: "error", text: "Please enter a whole number in minutes." });
      return;
    }
    if (m < 15 || m > 300) {
      setMsg({ type: "error", text: "Please enter a value between 15 and 300 minutes." });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ daily_study_minutes: m }),
      });

      const text = await res.text();
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch {}

      if (!res.ok) {
        setMsg({ type: "error", text: data?.message || "Failed to save daily study time." });
        return;
      }

      setMsg({ type: "success", text: "Daily study time saved successfully." });
    } finally {
      setSaving(false);
    }
  }

  return (
     <div className="study-time-bg">
     <main
  style={{
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  }}
>



          <div className="focus-card" style={{ maxWidth: 520, width: "100%", padding: 22 }}>
          <h1 style={{ margin: 0, color: "white" }}>Daily Study Time</h1>
          <p style={{ marginTop: 8, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
            Set how many minutes you can study per day. This will be used later to calculate your readiness timeline and create a realistic plan.
          </p>

          {loading ? (
            <p style={{ color: "rgba(255,255,255,0.7)" }}>Loading…</p>
          ) : (
            <form onSubmit={onSave} style={{ marginTop: 14, display: "grid", gap: 12 }}>
              <div className="glass" style={{ padding: 14, borderRadius: 16 }}>
                <label style={{ display: "block", color: "rgba(255,255,255,0.75)", fontSize: 12 }}>
                  Study time (minutes per day)
                </label>

                <input
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  inputMode="numeric"
                  placeholder="e.g., 60"
                  style={{
                    width: "100%",
                    padding: 12,
                    marginTop: 8,
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(0,0,0,0.18)",
                    color: "rgba(255,255,255,0.92)",
                    outline: "none",
                  }}
                />

                <div style={{ marginTop: 10, color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
                  Valid range: 15–300 minutes (recommended 45–120).
                </div>
              </div>

              <button
                disabled={saving}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: 0,
                  cursor: saving ? "not-allowed" : "pointer",
                  color: "white",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, rgba(99,102,241,1), rgba(236,72,153,1))",
                }}
              >
                {saving ? "Saving..." : "Save"}
              </button>

              {msg && (
                <div
                  className="glass"
                  style={{
                    padding: 12,
                    borderColor: msg.type === "error" ? "rgba(239,68,68,0.4)" : "rgba(34,197,94,0.4)",
                    color: msg.type === "error" ? "rgba(239,68,68,0.95)" : "rgba(34,197,94,0.95)",
                  }}
                >
                  {msg.text}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>

                <Link href="/dashboard" className="btn-dashboard">
                ← Back to Dashboard
                </Link>

                
              </div>
            </form>
          )}
        </div>
         

  </main>
</div>

  );
}

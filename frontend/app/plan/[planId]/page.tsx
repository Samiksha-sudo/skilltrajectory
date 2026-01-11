"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function PlanPage() {
  const params = useParams();
  const planId = params.planId as string;

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/plans/${planId}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) return setError(json?.message || "Failed to load plan");
        setData(json);
      } catch (e: any) {
        setError(String(e?.message || e));
      }
    })();
  }, [planId]);

  return (
    <div className="ai-bg">
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: 28 }}>
        <div className="focus-card" style={{ padding: 22 }}>
          <h1 style={{ marginTop: 0, color: "white" }}>Your Study Plan</h1>

          {error && <div className="glass" style={{ padding: 12, color: "#ef4444" }}>{error}</div>}

          {data?.plan && (
            <div className="glass" style={{ padding: 14, marginTop: 12 }}>
              <div style={{ color: "rgba(255,255,255,0.7)" }}>Focus Summary</div>
              <div style={{ color: "white", fontWeight: 700 }}>{data.plan.focus_summary}</div>
            </div>
          )}

          {data?.weeks?.length ? (
            <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
              {data.weeks.map((w: any) => (
                <div key={w.id} className="glass" style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <h3 style={{ margin: 0, color: "white" }}>Week {w.week_no}</h3>
                    <div style={{ color: "rgba(255,255,255,0.75)" }}>
                      {w.estimated_minutes} min
                    </div>
                  </div>

                  <p style={{ color: "rgba(255,255,255,0.75)", marginTop: 8 }}>
                    {w.objective}
                  </p>

                  <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                    {(Array.isArray(w.tasks_json) ? w.tasks_json : []).map((t: any, idx: number) => (
                      <div key={idx} className="glass" style={{ padding: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <strong style={{ color: "white" }}>{t.topic_tag}</strong>
                          <span style={{ color: "rgba(255,255,255,0.75)" }}>{t.minutes} min</span>
                        </div>
                        <ul style={{ marginTop: 8, color: "rgba(255,255,255,0.85)" }}>
                          {(t.tasks || []).map((x: string, i: number) => (
                            <li key={i}>{x}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "rgba(255,255,255,0.75)", marginTop: 12 }}>No weeks found.</p>
          )}

          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <Link className="btn-dashboard" href="/dashboard">Back to Dashboard</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

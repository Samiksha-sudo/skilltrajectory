"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import styles from "./results.module.css";

export default function ResultsPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [gaps, setGaps] = useState<any>(null);
  const weakTopics = gaps?.weakTopics ?? [];



  const cellKey = {
  padding: "10px",
  color: "rgba(255,255,255,0.7)",
  width: "35%",
  verticalAlign: "top",
};

const cellVal = {
  padding: "10px",
  color: "white",
};

async function handleReattempt() {
  const res = await fetch("/api/attempts/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}), // test inferred or active test
  });

  const json = await res.json();

  if (!res.ok) {
    alert(json.message || "Failed to start reattempt");
    return;
  }

  window.location.href = `/test/${json.attemptId}`;
}



  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/attempts/${attemptId}/readiness`, { cache: "no-store" });
        const text = await res.text();
        const json = text ? JSON.parse(text) : {};
        if (!res.ok) {
          setError(json?.message || "Failed to load readiness");
          return;
        }
        setData(json);
      } catch (e: any) {
        setError(String(e?.message || e));
      }
    })();
  }, [attemptId]);

  useEffect(() => {
  (async () => {
    try {
      const res = await fetch(`/api/attempts/${attemptId}/gaps`, { cache: "no-store" });
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (res.ok) setGaps(json);
    } catch {
      // ignore
    }
  })();
}, [attemptId]);


  return (
    <div className="ai-bg">
      <main style={{ maxWidth: 900, margin: "0 auto", padding: 28 }}>
        <div className="focus-card" style={{ padding: 22 }}>
<div style={{ marginBottom: 14 }}>
  <h1 style={{ margin: 0, color: "white", fontSize: 32, fontWeight: 900 }}>
    Test Results
  </h1>
  <p style={{ color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
    Attempt #{attemptId} • Performance & insights
  </p>
</div>


          {error && (
            <div className="glass" style={{ padding: 12, color: "#ef4444" }}>
              {error}
            </div>
          )}

          {data && (
            <>
              <div
  className="glass"
  style={{
    padding: 20,
    marginTop: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
  }}
>

                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>Readiness Level</div>
                   <div
  style={{
    color: "#a78bfa",
    fontSize: 34,
    fontWeight: 900,
    letterSpacing: 0.4,
  }}
>

                      {data.readiness_level}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>Confidence</div>
                    <div style={{ color: "white", fontSize: 20, fontWeight: 700 }}>
                      {data.confidence_score}
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass" style={{ padding: 16, marginTop: 12 }}>
                <h3 style={{ marginTop: 0, color: "white" }}>Explanation</h3>
                    {data?.explanation && (
                    <div className="glass" style={{ padding: 16, marginTop: 14 }}>
                        <h3 style={{ marginTop: 0, color: "white" }}>Readiness Explanation</h3>

                        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
                        <tbody>
                            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>

                            <td style={cellKey}>Score Percentage</td>
                            <td style={cellVal}>
                                {data.explanation.score_pct != null
                                ? `${data.explanation.score_pct}%`
                                : "N/A"}
                            </td>
                            </tr>

                            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>

                            <td style={cellKey}>Readiness Rule Applied</td>
                            <td style={cellVal}>{data.explanation.rule_applied}</td>
                            </tr>

                            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>

                            <td style={cellKey}>Thresholds</td>
                            <td style={cellVal}>
                                Beginner: {data.explanation.thresholds?.beginner} <br />
                                Intermediate: {data.explanation.thresholds?.intermediate} <br />
                                Interview-Ready: {data.explanation.thresholds?.interview_ready}
                            </td>
                            </tr>

                            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>

                            <td style={cellKey}>Explanation</td>
                            <td style={cellVal}>{data.explanation.notes}</td>
                            </tr>
                        </tbody>
                        </table>
                    </div>
                    )}

              </div>
            </>
          )}

          {gaps && (
  <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
    {/* Weak Topics */}
    <div className="glass" style={{ padding: 16 }}>
      <h3 style={{ marginTop: 0, color: "#ef4444", fontWeight: 900 }}>
  Weak Areas
</h3>


      {gaps.weakTopics?.length ? (
        <div style={{ display: "grid", gap: 10 }}>
          {gaps.weakTopics.map((t: any) => (
            <div
  key={t.topic_tag}
  className="glass"
  style={{
    padding: 12,
    borderLeft: "4px solid #ef4444",
  }}
>

              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                
                <strong style={{ color: "white" }}>{t.topic_tag}</strong>
                
                <span style={{ color: "#ef4444", fontWeight: 700 }}>
                  {t.accuracy_pct}%
                </span>
              </div>
              <div style={{ fontSize: 12, opacity: 0.75, color: "rgba(255,255,255,0.75)" }}>
                Correct: {t.correct}/{t.total} • Sections: {t.sections?.join(", ") || "—"}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: "rgba(255,255,255,0.7)" }}>
          No weak areas detected (below {gaps.thresholds?.weak_below ?? 60}%).
        </p>
      )}
    </div>

    {/* Strengths */}
    <div className="glass" style={{ padding: 16 }}>
      <h3 style={{ marginTop: 0, color: "#22c55e", fontWeight: 900 }}>
  Strengths
</h3>


            {gaps.strengths?.length ? (
                <div style={{ display: "grid", gap: 10 }}>
                {gaps.strengths.map((t: any) => (
                    <div key={t.topic_tag} className="glass" style={{ padding: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <strong style={{ color: "white" }}>{t.topic_tag}</strong>
                        <span style={{ color: "#22c55e", fontWeight: 700 }}>
                        {t.accuracy_pct}%
                        </span>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.75, color: "rgba(255,255,255,0.75)" }}>
                        Correct: {t.correct}/{t.total} • Sections: {t.sections?.join(", ") || "—"}
                    </div>
                    </div>
                ))}
                </div>
            ) : (
                <p style={{ color: "rgba(255,255,255,0.7)" }}>
                Strengths will appear after you score at least {gaps.thresholds?.strength_from ?? 80}% in a topic.
                </p>
            )}
            </div>
        </div>
        )}

        <button
  className="btn-dashboard"
  style={{
    marginTop: 18,
    padding: "12px 18px",
    fontWeight: 900,
    fontSize: 15,
    background:
      "linear-gradient(135deg, rgba(34,197,94,0.25), rgba(59,130,246,0.25))",
    border: "1px solid rgba(255,255,255,0.18)",
  }}
  disabled={!weakTopics.length}
  onClick={async () => {
    const res = await fetch("/api/plans/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attemptId: Number(attemptId),
        weakTopics,
        focusSummary: "Auto-generated from skill gaps",
      }),
      cache: "no-store",
    });

    const data = await res.json();
    if (res.ok) window.location.href = `/plan/${data.planId}`;
  }}
>
  Generate Personalised Study Plan →
</button>

            
<section className={styles.reattemptCard}>
  <div className={styles.reattemptInner}>
    <div className={styles.reattemptLeft}>
      <div className={styles.badgeIcon}>↻</div>
      <div>
        <p className={styles.reattemptTitle}>Retake the test to measure improvement</p>
        <div className={styles.reattemptMeta}>
          A new attempt will be created. Your previous results remain preserved.
        </div>
      </div>
    </div>

    <button className={styles.btnPrimary} onClick={handleReattempt}>
      <span>Retake Test</span>
      <span style={{ opacity: 0.85 }}>→</span>
    </button>
  </div>

  <div className={styles.smallNote}>
    Tip: Retake after completing at least one week of your study plan to see measurable gains.
  </div>
</section>




          <div
  style={{
    marginTop: 22,
    display: "flex",
    gap: 14,
    alignItems: "center",
    flexWrap: "wrap",
  }}
>

            <Link href="/dashboard" className="btn-dashboard">Back to Dashboard</Link>
            <Link href={`/test/start`} style={{ color: "rgba(255,255,255,0.75)" }}>Start another test</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

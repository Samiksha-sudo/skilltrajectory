"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ResultsPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="ai-bg">
      <main style={{ maxWidth: 900, margin: "0 auto", padding: 28 }}>
        <div className="focus-card" style={{ padding: 22 }}>
          <h1 style={{ marginTop: 0, color: "white" }}>Readiness Result</h1>
          <p style={{ color: "rgba(255,255,255,0.65)" }}>Attempt ID: {attemptId}</p>

          {error && (
            <div className="glass" style={{ padding: 12, color: "#ef4444" }}>
              {error}
            </div>
          )}

          {data && (
            <>
              <div className="glass" style={{ padding: 16, marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>Readiness Level</div>
                    <div style={{ color: "white", fontSize: 28, fontWeight: 800 }}>
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
        <tr>
          <td style={cellKey}>Score Percentage</td>
          <td style={cellVal}>
            {data.explanation.score_pct != null
              ? `${data.explanation.score_pct}%`
              : "N/A"}
          </td>
        </tr>

        <tr>
          <td style={cellKey}>Readiness Rule Applied</td>
          <td style={cellVal}>{data.explanation.rule_applied}</td>
        </tr>

        <tr>
          <td style={cellKey}>Thresholds</td>
          <td style={cellVal}>
            Beginner: {data.explanation.thresholds?.beginner} <br />
            Intermediate: {data.explanation.thresholds?.intermediate} <br />
            Interview-Ready: {data.explanation.thresholds?.interview_ready}
          </td>
        </tr>

        <tr>
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

          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <Link href="/dashboard" className="btn-dashboard">Back to Dashboard</Link>
            <Link href={`/test/start`} style={{ color: "rgba(255,255,255,0.75)" }}>Start another test</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

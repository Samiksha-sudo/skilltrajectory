"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ComparePage() {
  const sp = useSearchParams();
  const oldId = sp.get("oldId");
  const newId = sp.get("newId");

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `/api/attempts/compare?oldId=${oldId}&newId=${newId}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
        setData(json);
      } catch (e: any) {
        setError(e.message);
      }
    })();
  }, [oldId, newId]);

  if (error) return <p>{error}</p>;
  if (!data) return <p>Loading...</p>;

  return (
    <div className="ai-bg">
      <main style={{ maxWidth: 900, margin: "auto", padding: 30 }}>
        <div className="focus-card">
          <h1 style={{ color: "white" }}>Score Comparison</h1>

          <div className="glass" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <strong>Attempt #{data.old.attemptId}</strong>
                <p>{data.old.scorePct}% • {data.old.readiness}</p>
              </div>

              <div>
                <strong>Attempt #{data.new.attemptId}</strong>
                <p>{data.new.scorePct}% • {data.new.readiness}</p>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color:
                    data.delta.direction === "UP"
                      ? "#22c55e"
                      : data.delta.direction === "DOWN"
                      ? "#ef4444"
                      : "#3b82f6",
                }}
              >
                {data.delta.direction === "UP" && "▲ Improvement "}
                {data.delta.direction === "DOWN" && "▼ Decline "}
                {data.delta.direction === "FLAT" && "▬ No Change "}
                ({data.delta.value}%)
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <Link href="/dashboard" className="btn-dashboard">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

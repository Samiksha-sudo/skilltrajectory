"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function AttemptPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Timer: 10 minutes (S05 scope)
  const totalSeconds = 10 * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

const elapsedSec = totalSeconds - secondsLeft;
const [submitting, setSubmitting] = useState(false);
const [submitted, setSubmitted] = useState(false);


  const mmss = useMemo(() => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [secondsLeft]);

  async function submitTest(reason: "manual" | "auto") {
  if (submitting || submitted) return;

  setSubmitting(true);
  setError(null);

  try {
    const res = await fetch(`/api/attempts/${attemptId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ elapsedSec }),
      cache: "no-store",
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
      setError(`${res.status}: ${data?.message || "Submit failed"}`);
      setSubmitting(false);
      return;
    }

    setSubmitted(true);

    // Simple next step: go back dashboard (later: /results/[attemptId])
    window.location.href = "/dashboard";
  } catch (e: any) {
    setError(`Submit error: ${String(e?.message || e)}`);
  } finally {
    setSubmitting(false);
  }
}

useEffect(() => {
  if (secondsLeft === 0 && !submitted) {
    submitTest("auto");
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [secondsLeft]);



  // Start timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load questions
  useEffect(() => {
    if (!attemptId) return;

    (async () => {
      try {
        const res = await fetch(`/api/attempts/${attemptId}/questions`);
        const text = await res.text();

        let data: any = {};
        try { data = text ? JSON.parse(text) : {}; }
        catch { throw new Error(`Non-JSON response (${res.status}): ${text.slice(0, 120)}`); }

        if (!res.ok) throw new Error(`${res.status}: ${data?.message || "Failed"}`);
        setQuestions(data.questions || []);

      } catch {
        setError("Failed to load questions.");
      } finally {
        setLoading(false);
      }
    })();
  }, [attemptId]);

  return (
     <div className="apti-bg">
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: 28 }}>
        <div className="focus-card apti-bg" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
            <div>
              <h1 style={{ margin: 0, color: "white" }}>Aptitude Test</h1>
              <p style={{ color: "rgba(255,255,255,0.7)" }}>
                Attempt ID: {attemptId}
              </p>
            </div>

            <div className="glass" style={{ padding: 14, minWidth: 160, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Time Left</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "white" }}>
                {mmss}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16 }} />

          {loading ? (
            <p style={{ color: "rgba(255,255,255,0.7)" }}>Loading questions…</p>
          ) : error ? (
            <div className="glass" style={{ padding: 12, color: "#ef4444" }}>
              {error}
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {questions.map((q, idx) => (
                <div key={q.id} className="glass" style={{ padding: 14 }}>
                  <strong style={{ color: "white" }}>
                    Q{idx + 1}. {q.question_text}
                  </strong>

                  <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
                    {q.options_json.map((opt: string, i: number) => (
                      <label key={i} className="glass" style={{ padding: 10 }}>
                       <input
                        type="radio"
                        name={`q_${q.id}`}
                        onChange={async () => {
                          await fetch(`/api/attempts/${attemptId}/answer`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ questionId: q.id, selectedOption: opt }),
                            cache: "no-store",
                          });
                        }}
                      />
                      {" "}
                        <span style={{ color: "white" }}>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
  className="btn-dashboard"
  onClick={() => submitTest("manual")}
  disabled={submitting || submitted}
  style={{ justifyContent: "center" }}
>
  {submitting ? "Submitting..." : "Submit Test"}
</button>


          <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between" }}>
            <Link href="/dashboard" className="btn-dashboard">
              ← Back to Dashboard
            </Link>
            <Link href="/test/start" style={{ color: "rgba(255,255,255,0.7)" }}>
              Start new attempt
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

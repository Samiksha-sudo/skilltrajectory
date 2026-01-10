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

  const SECTIONS = [
    { key: "APTITUDE", label: "Aptitude" },
    { key: "LOGIC", label: "Logic" },
    { key: "CS", label: "CS Fundamentals" },
    { key: "CODING", label: "Coding Basics" },
  ];

  const [activeSection, setActiveSection] = useState(SECTIONS[0].key);
  const [loadingQs, setLoadingQs] = useState(false);


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

  useEffect(() => {
    if (!attemptId) return;

    (async () => {
      setLoadingQs(true);
      try {
        const res = await fetch(
          `/api/attempts/${attemptId}/questions?section=${activeSection}`,
          { cache: "no-store" }
        );

        const data = await res.json();
        setQuestions(data.questions || []);
      } catch {
        setQuestions([]);
      } finally {
        setLoadingQs(false);
      }
    })();
  }, [attemptId, activeSection]);


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
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          throw new Error(
            `Non-JSON response (${res.status}): ${text.slice(0, 120)}`
          );
        }

        if (!res.ok)
          throw new Error(`${res.status}: ${data?.message || "Failed"}`);
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1 style={{ margin: 0, color: "white" }}>Aptitude Test</h1>
              <p style={{ color: "rgba(255,255,255,0.7)" }}>
                Attempt ID: {attemptId}
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              {SECTIONS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: "none",
                    cursor: "pointer",
                    background:
                      activeSection === s.key
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(255,255,255,0.08)",
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>


            <div
              className="glass"
              style={{ padding: 14, minWidth: 160, textAlign: "center" }}
            >
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                Time Left
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "white" }}>
                {mmss}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16 }} />

      <h2 style={{ marginBottom: 12 }}>
        {SECTIONS.find((s) => s.key === activeSection)?.label}
      </h2>

{loading ? (
  <p>Loading questions…</p>
) : questions.length === 0 ? (
  <p>No questions in this section.</p>
) : (
  questions.map((q, idx) => {
    const opts = Array.isArray(q.options_json)
      ? q.options_json
      : JSON.parse(q.options_json || "[]");

    return (
      <div key={q.id} className="glass" style={{ padding: 16, marginBottom: 12 }}>
        <p>
          <strong>Q{idx + 1}.</strong> {q.question_text}
        </p>

        {opts.map((opt: string, i: number) => (
          <label key={i} style={{ display: "block", marginTop: 6 }}>
            <input type="radio" name={`q_${q.id}`} /> {opt}
          </label>
        ))}
      </div>
    );
  })
)}

          <button
            className="btn-dashboard"
            onClick={() => submitTest("manual")}
            disabled={submitting || submitted}
            style={{ justifyContent: "center" }}
          >
            {submitting ? "Submitting..." : "Submit Test"}
          </button>

          <div
            style={{
              marginTop: 16,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
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

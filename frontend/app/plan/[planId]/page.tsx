"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import styles from "./plan.module.css";

function safeJsonParse(text: string) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export default function PlanPage() {
  const params = useParams();
  const planId = params.planId as string;

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [openWeek, setOpenWeek] = useState<number | null>(1);

  // -------- Fetch plan + estimate (keep as you have, but safer parsing) --------
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/plans/${planId}`, { cache: "no-store" });
        const text = await res.text();
        const json = safeJsonParse(text);

        if (!res.ok) {
          setError(json?.message || `Failed to load plan (${res.status})`);
          return;
        }
        setData(json);
      } catch (e: any) {
        setError(String(e?.message || e));
      }
    })();

    (async () => {
      try {
        const res = await fetch(`/api/plans/${planId}/time-estimate`, { cache: "no-store" });
        const text = await res.text();
        const json = safeJsonParse(text);
        if (res.ok) setEstimate(json);
      } catch {
        // ignore
      }
    })();
  }, [planId]);

  // -------- Fetch milestones --------
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/plans/${planId}/milestones`, { cache: "no-store" });
        const text = await res.text();
        const json = safeJsonParse(text);
        if (res.ok) setMilestones(json?.milestones || []);
      } catch {
        // ignore
      }
    })();
  }, [planId]);

  // -------- Derived KPIs --------
  const kpis = useMemo(() => {
    const weeksCount = milestones?.length || data?.weeks?.length || 0;
    const totalMin =
      (data?.weeks || []).reduce((sum: number, w: any) => sum + (w.estimated_minutes || 0), 0) || 0;

    return [
      {
        label: "Plan Weeks",
        value: String(weeksCount),
        sub: weeksCount ? "Structured milestones" : "Generate a plan first",
      },
      {
        label: "Total Workload",
        value: totalMin ? `${totalMin} min` : "—",
        sub: totalMin ? "Estimated total effort" : "Awaiting schedule",
      },
      {
        label: "Daily Study Time",
        value: estimate?.daily_study_minutes ? `${estimate.daily_study_minutes} min/day` : "—",
        sub: "From profile settings",
      },
    ];
  }, [data, milestones, estimate]);

  // Visual progress fill (purely illustrative)
  const progressPct = useMemo(() => {
    const weeksCount = milestones?.length || 0;
    if (!weeksCount || !openWeek) return 0;
    return Math.round((openWeek / weeksCount) * 100);
  }, [milestones, openWeek]);

  return (
    <div className="ai-bg">
      <div className={styles.page}>
        <div className={styles.shell}>
          {/* HERO */}
          <section className={`${styles.hero} glass`}>
            <div className={styles.heroInner}>
              <div className={styles.titleBlock}>
                <h1 style={{ color: "white" }}>Your Study Plan</h1>
                <p className={styles.subtitle}>
                  A gap-driven roadmap with weekly milestones and a time-to-readiness estimate.
                </p>
              </div>

              <div className={styles.pills}>
                <span className={`${styles.pill} ${styles.pillBlue}`}>
                  Plan ID: {planId}
                </span>
                <span className={`${styles.pill} ${styles.pillGreen}`}>
                  Milestones: {milestones?.length || 0}
                </span>
                <span className={`${styles.pill} ${styles.pillPurple}`}>
                  Status: Active
                </span>
              </div>
            </div>
          </section>

          {error && <div className={styles.errorBox}>{error}</div>}

          {/* GRID: Left = Milestones, Right = Summary */}
          <div className={styles.grid}>
            {/* LEFT */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Weekly Milestones</h2>
              <div className={styles.cardMeta}>
                Click a week to expand tasks. Weeks are designed as achievable goals.
              </div>

              {/* Progress indicator (visual) */}
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
              </div>

              <div className={styles.milestonesWrap}>
                {milestones?.length ? (
                  milestones.map((m: any) => {
                    const isOpen = openWeek === m.week_no;

                    return (
                      <div key={m.week_no} className={styles.milestone}>
                        <button
                          onClick={() => setOpenWeek(isOpen ? null : m.week_no)}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            background: "transparent",
                            border: 0,
                            cursor: "pointer",
                            color: "white",
                            padding: 0,
                          }}
                        >
                          <div className={styles.mRow}>
                            <div className={styles.mLeft}>
                              <div className={styles.weekTag}>
                                <span className={styles.dot} />
                                Week {m.week_no}
                              </div>
                              <div className={styles.mTitle}>{m.milestone_title}</div>
                              <div className={styles.mObjective}>{m.objective}</div>
                            </div>

                            <div className={styles.mRight}>
                              <span className={`${styles.badge} ${styles.badgeMinutes}`}>
                                {m.estimated_minutes} min
                              </span>
                              <div className={styles.toggleHint}>
                                {isOpen ? "Hide details" : "View details"}
                              </div>
                            </div>
                          </div>
                        </button>

                        {isOpen && (
                          <div className={styles.details}>
                            {(m.tasks || []).map((t: any, idx: number) => (
                              <div key={idx} className={styles.taskCard}>
                                <div className={styles.taskHeader}>
                                  <span className={styles.topic}>{t.topic_tag}</span>
                                  <span className={styles.mins}>{t.minutes} min</span>
                                </div>
                                <ul className={styles.taskList}>
                                  {(t.tasks || []).map((x: string, i: number) => (
                                    <li key={i}>{x}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}

                            {!m.tasks?.length && (
                              <div style={{ opacity: 0.75 }}>
                                No milestone tasks available for this week.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="glass" style={{ padding: 14, color: "rgba(255,255,255,0.75)" }}>
                    No milestones available yet. Generate a study plan first.
                  </div>
                )}
              </div>

              <div className={styles.smallNote}>
                Milestones are derived from your weak-topic priorities and allocated minutes based on daily study time.
              </div>
            </section>

            {/* RIGHT */}
            <aside className={styles.card}>
              <h2 className={styles.cardTitle}>Overview</h2>

              {data?.plan && (
                <div className="glass" style={{ padding: 14, marginTop: 10 }}>
                  <div style={{ opacity: 0.75, fontSize: 12 }}>Focus Summary</div>
                  <div style={{ fontWeight: 900, marginTop: 6 }}>{data.plan.focus_summary}</div>
                </div>
              )}

              {/* KPI Row */}
              <div className={styles.kpiRow}>
                {kpis.map((k) => (
                  <div key={k.label} className={styles.kpi}>
                    <div className={styles.kpiLabel}>{k.label}</div>
                    <div className={styles.kpiValue}>{k.value}</div>
                    <div className={styles.kpiSub}>{k.sub}</div>
                  </div>
                ))}
              </div>

              {/* Estimate */}
              {estimate && (
                <div className="glass" style={{ padding: 16, marginTop: 12 }}>
                  <div style={{ opacity: 0.75, fontSize: 12 }}>Estimated Time to Readiness</div>
                  <div className={styles.estimateBig}>
                    {estimate.estimated_days} days (~{estimate.estimated_weeks} weeks)
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.75, marginTop: 6 }}>
                    Based on {estimate.daily_study_minutes} minutes/day and your personalised plan.
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.65, marginTop: 8 }}>
                    {estimate.explanation?.note}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className={styles.actions}>
                <Link className={`${styles.btn} ${styles.btnPrimary}`} href="/dashboard">
                  Back to Dashboard
                </Link>
                <Link className={styles.btn} href="/test/start">
                  Take Another Test
                </Link>
              </div>

              {/* Optional: Raw weeks display as secondary */}
              <details style={{ marginTop: 14 }}>
                <summary style={{ cursor: "pointer", opacity: 0.85, fontWeight: 800 }}>
                  View raw weekly plan data
                </summary>

                {data?.weeks?.length ? (
                  <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                    {data.weeks.map((w: any) => (
                      <div key={w.id} className="glass" style={{ padding: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <strong>Week {w.week_no}</strong>
                          <span style={{ opacity: 0.75 }}>{w.estimated_minutes} min</span>
                        </div>
                        <div style={{ opacity: 0.75, marginTop: 6 }}>{w.objective}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ opacity: 0.75, marginTop: 8 }}>No weeks found.</p>
                )}
              </details>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

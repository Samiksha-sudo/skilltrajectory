"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./analytics.module.css";

type Summary = {
  generatedAt: string;
  kpis: {
    usersCount: number;
    attemptsCount: number;
    submittedCount: number;
    completionRatePct: number;
    avgScorePct: string | null;
  };
  trend: { day: string; submitted: number; avgScorePct: string | null }[];
  weakTopics: { topic_tag: string; avgGap: string; occurrences: number }[];
  recentActivity: {
    attemptId: number;
    email: string;
    status: string;
    startedAt: string;
    submittedAt: string | null;
    scorePct: number | null;
  }[];
};

function fmtDay(d: string) {
  // "YYYY-MM-DD" -> short
  return d?.slice(5) || d;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setErr(null);
    try {
      const res = await fetch("/api/admin/analytics/summary", { cache: "no-store" });
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;
      if (!res.ok) {
        setErr(json?.message || "Access denied");
        return;
      }
      setData(json);
    } catch (e: any) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // Periodic refresh (Acceptance Criteria)
    const t = setInterval(load, 15000); // 15 seconds
    return () => clearInterval(t);
  }, []);

  const maxSubmitted = useMemo(() => {
    if (!data?.trend?.length) return 1;
    return Math.max(...data.trend.map((x) => x.submitted), 1);
  }, [data]);

  return (
    <div className={styles.page}>
      <main className={styles.container}>
        <header className={styles.hero}>
          <div>
            <h1 className={styles.title}>Usage Analytics</h1>
            <p className={styles.subTitle}>
              Platform-level activity, completion, and performance trends. Auto-refresh enabled every 15 seconds.
            </p>
          </div>
          <div className={styles.heroRight}>
            <div className={styles.pill}>ADMIN</div>
            <Link className={styles.btnGhost} href="/admin">
              Back to Admin
            </Link>
          </div>
        </header>

        {err && <div className={styles.errBox}>{err}</div>}

        <section className={styles.card}>
          <div className={styles.inner}>
            <div className={styles.cardHeader}>
              <h2 className={styles.sectionTitle}>KPIs</h2>
              <div className={styles.meta}>
                {data?.generatedAt ? `Last updated: ${new Date(data.generatedAt).toLocaleString()}` : "—"}
              </div>
            </div>

            <div className={styles.kpis}>
              <div className={styles.kpi}>
                <div className={styles.kpiLabel}>Users</div>
                <div className={styles.kpiValue}>{data?.kpis?.usersCount ?? "—"}</div>
                <div className={styles.kpiHint}>Registered accounts</div>
              </div>

              <div className={styles.kpi}>
                <div className={styles.kpiLabel}>Attempts</div>
                <div className={styles.kpiValue}>{data?.kpis?.attemptsCount ?? "—"}</div>
                <div className={styles.kpiHint}>All started attempts</div>
              </div>

              <div className={styles.kpi}>
                <div className={styles.kpiLabel}>Submitted</div>
                <div className={styles.kpiValue}>{data?.kpis?.submittedCount ?? "—"}</div>
                <div className={styles.kpiHint}>Completed attempts</div>
              </div>

              <div className={styles.kpi}>
                <div className={styles.kpiLabel}>Completion Rate</div>
                <div className={styles.kpiValue}>{data?.kpis?.completionRatePct ?? "—"}%</div>
                <div className={styles.kpiHint}>Submitted / Attempts</div>
              </div>

              <div className={styles.kpi}>
                <div className={styles.kpiLabel}>Avg Score</div>
                <div className={styles.kpiValue}>{data?.kpis?.avgScorePct != null ? `${data.kpis.avgScorePct}%` : "—"}</div>
                <div className={styles.kpiHint}>Across scored attempts</div>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.grid}>
          {/* Trend */}
          <section className={styles.card}>
            <div className={styles.inner}>
              <div className={styles.cardHeader}>
                <h2 className={styles.sectionTitle}>Performance Trend (Last 7 Days)</h2>
                <div className={styles.meta}>Submissions + average score</div>
              </div>

              {!data?.trend?.length ? (
                <div className={styles.empty}>No trend data yet (submit some tests to populate).</div>
              ) : (
                <div className={styles.bars}>
                  {data.trend.map((t) => {
                    const pct = Math.round((t.submitted / maxSubmitted) * 100);
                    return (
                      <div key={t.day} className={styles.barRow}>
                        <div className={styles.barLabel}>{fmtDay(t.day)}</div>

                        <div className={styles.barTrack}>
                          <div className={styles.barFill} style={{ width: `${pct}%` }} />
                        </div>

                        <div className={styles.barMeta}>
                          <strong>{t.submitted}</strong> submitted
                          <span className={styles.dot}>•</span>
                          Avg: <strong>{t.avgScorePct != null ? `${t.avgScorePct}%` : "—"}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Weak Topics */}
          <aside className={styles.card}>
            <div className={styles.inner}>
              <div className={styles.cardHeader}>
                <h2 className={styles.sectionTitle}>Weak Topics Leaderboard</h2>
                <div className={styles.meta}>Based on skill_gaps aggregation</div>
              </div>

              {!data?.weakTopics?.length ? (
                <div className={styles.empty}>No skill gap data yet.</div>
              ) : (
                <div className={styles.list}>
                  {data.weakTopics.map((w) => (
                    <div key={w.topic_tag} className={styles.item}>
                      <div>
                        <div className={styles.itemTitle}>{w.topic_tag}</div>
                        <div className={styles.itemMeta}>
                          Avg Gap: <strong>{w.avgGap}</strong> • Occurrences: <strong>{w.occurrences}</strong>
                        </div>
                      </div>
                      <div className={styles.badge}>TOP</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Recent activity */}
        <section className={styles.card} style={{ marginTop: 12 }}>
          <div className={styles.inner}>
            <div className={styles.cardHeader}>
              <h2 className={styles.sectionTitle}>Recent Activity</h2>
              <div className={styles.meta}>Latest attempts across users</div>
            </div>

            {!data?.recentActivity?.length ? (
              <div className={styles.empty}>No recent attempts yet.</div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Attempt</th>
                      <th className={styles.th}>User</th>
                      <th className={styles.th}>Status</th>
                      <th className={styles.th}>Score</th>
                      <th className={styles.th}>Started</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentActivity.map((a) => (
                      <tr key={a.attemptId}>
                        <td className={styles.td}>#{a.attemptId}</td>
                        <td className={styles.td}>{a.email}</td>
                        <td className={styles.td}>{a.status}</td>
                        <td className={styles.td}>{a.scorePct != null ? `${a.scorePct}%` : "—"}</td>
                        <td className={styles.td}>{new Date(a.startedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

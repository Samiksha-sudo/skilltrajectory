"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./dashboard.module.css";

type MeOk = {
  user: {
    id: number;
    name: string | null;
    email: string;
    role: string;
    created_at: string;
  };
};

type MeErr = { message: string };

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<MeOk | MeErr | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const attempted = summary?.attemptsCount ?? 0;
  const best = summary?.bestScorePct != null ? `${summary.bestScorePct}%` : "—";
  const readiness = summary?.readiness?.level ?? "—";
  const latestScore =
  summary?.recentActivity?.[0]?.scorePct != null
    ? `${summary.recentActivity[0].scorePct}%`
    : null;



  useEffect(() => {
    (async () => {
      const res = await fetch("/api/dashboard/summary", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setSummary(data);
    })();
  }, []);


  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/me", { method: "GET" });
        const data = (await res.json()) as MeOk | MeErr;

        if (!res.ok) {
          window.location.href = "/login";
          return;
        }
        setMe(data);
      } catch {
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const user = !loading && me && "user" in me ? me.user : null;

  // Placeholder metrics for now (S04+ will replace with real data)
const kpis = useMemo(() => {
  const attempts = summary?.attemptsCount ?? 0;
const bestScoreValue =
  summary?.bestScorePct != null ? `${summary.bestScorePct}%` : "—";


  return [
    {
      label: "Tests Attempted",
      value: String(attempts),
      sub: attempts === 0 ? "Start your first test" : "Completed assessments",
    },
{
      label: "Best Score",
      value: bestScoreValue,
      sub:
        bestScoreValue !== "—"
          ? "Highest score achieved"
          : "No scored attempts yet",
    },
    {
      label: "Readiness",
      value: readiness,
      sub: summary?.readiness ? "Based on latest attempt" : "Generated after scoring",
    },
    {
      label: "Latest Score",
      value: latestScore,
      sub: latestScore !== "—" ? "From most recent aptitude test" : "No scored attempt yet",
    },
  ];
}, [summary, latestScore]);



  return (
    <div className={styles.page}>
      <div className={`${styles.blob} ${styles.blob1}`} />
      <div className={`${styles.blob} ${styles.blob2}`} />
      <div className={`${styles.blob} ${styles.blob3}`} />

      <div className={styles.container}>
        <header className={styles.topbar}>
          <div className={styles.brand}>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>
              Your learning journey, progress and test history will appear here.
            </p>
          </div>

          <div className={styles.actions}>
            <Link className={styles.button} href="/profile/study-time">
              Set Study Time
            </Link>

            <Link className={styles.button} href="/test/start">
                Start Test
            </Link>

            <Link className={styles.button} href="/login">
                Switch User
            </Link>
        </div>

        </header>

        {loading && (
          <div className={styles.grid}>
            <div className={styles.skeleton}>
              <div className={styles.shimmer} style={{ width: "45%" }} />
              <div style={{ height: 10 }} />
              <div className={styles.shimmer} style={{ width: "80%" }} />
              <div style={{ height: 10 }} />
              <div className={styles.shimmer} style={{ width: "70%" }} />
              <div style={{ height: 14 }} />
              <div className={styles.shimmer} style={{ width: "100%", height: 72, borderRadius: 16 }} />
            </div>

            <div className={styles.skeleton}>
              <div className={styles.shimmer} style={{ width: "55%" }} />
              <div style={{ height: 10 }} />
              <div className={styles.shimmer} style={{ width: "95%" }} />
              <div style={{ height: 10 }} />
              <div className={styles.shimmer} style={{ width: "90%" }} />
              <div style={{ height: 10 }} />
              <div className={styles.shimmer} style={{ width: "85%" }} />
            </div>
          </div>
        )}

        {!loading && user && (
          <div className={styles.grid}>
            {/* LEFT: KPIs + Activity */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Overview</h2>
                <span className={styles.pill}>Session verified</span>
              </div>

              <div className={styles.kpis}>
                {kpis.map((k) => (
                  <div key={k.label} className={styles.kpi}>
                    <div className={styles.kpiLabel}>{k.label}</div>
                    <p className={styles.kpiValue}>{k.value}</p>
                    <div className={styles.kpiSub}>{k.sub}</div>
                  </div>
                ))}
              </div>

              <div style={{ height: 12 }} />

              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Recent activity</h3>
              </div>

              <div className={styles.list}>
                <div className={styles.item}>
                {summary?.recentActivity?.length ? (
                  summary.recentActivity.map((a: any) => (
                    <div key={a.attemptId} className="glass" style={{ padding: 12, marginTop: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Attempt #{a.attemptId}</span>
                        <strong>
                          {a.scorePct != null ? `${a.scorePct}%` : a.status}
                        </strong>
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.65 }}>
                        {new Date(a.startedAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No tests attempted yet</p>
                )}


                  <p className={styles.itemMeta}>
                    Start your first aptitude test to generate scoring, readiness level, and skill gaps.
                  </p>
                </div>
                <div className={styles.item}>
                  <p className={styles.itemTitle}>Next recommended step</p>
                  <p className={styles.itemMeta}>
                    Go to “Start Test” to begin a timed assessment. Your dashboard will populate automatically.
                  </p>
                </div>
              </div>
            </section>

            {/* RIGHT: Profile */}
            <aside className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Profile</h2>
                <span className={styles.pill}>{user.role}</span>
              </div>

              <div className={styles.profileRow}>
                <div className={styles.profileLine}>
                  <span className={styles.profileKey}>Name</span>
                  <span className={styles.profileVal}>{user.name || "—"}</span>
                </div>
                <div className={styles.profileLine}>
                  <span className={styles.profileKey}>Email</span>
                  <span className={styles.profileVal}>{user.email}</span>
                </div>
                <div className={styles.profileLine}>
                  <span className={styles.profileKey}>Member since</span>
                  <span className={styles.profileVal}>{formatDate(user.created_at)}</span>
                </div>
                <div className={styles.profileLine}>
                  <span className={styles.profileKey}>Status</span>
                  <span className={styles.profileVal}>Active</span>
                </div>
              </div>

              <div style={{ height: 14 }} />

              <div className={styles.list}>
                <div className={styles.item}>
                  <p className={styles.itemTitle}>Quick tips</p>
                  <p className={styles.itemMeta}>
                    Keep daily study time consistent. After your first test, you will receive a weekly study plan.
                  </p>
                </div>
              </div>
              <div style={{ margin: 20 }}>
                <Link className={`${styles.button} ${styles.primary}`} href="/profile/setup">
                    Edit Profile
                </Link>
                </div>

            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./admin.module.css";

export default function AdminDashboardPage() {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [summary, setSummary] = useState<any>(null);

    useEffect(() => {
    (async () => {
        const res = await fetch("/api/admin/summary", { cache: "no-store" });
        console.log("response for summary",JSON.stringify(res))
        if (!res.ok) return;
        const json = await res.json();
        setSummary(json);
    })();
    }, []);

    async function handleAdminLogout() {
      await fetch("/api/admin/logout", { method: "POST" });
      window.location.href = "/admin/login";
    }


  // Optional: later you can populate real stats from an admin summary endpoint
const kpis = useMemo(() => {
  return [
    {
      label: "Questions",
      value: summary?.questionsCount ?? "—",
      hint: "Question bank size",
    },
    {
      label: "Attempts",
      value: summary?.attemptsCount ?? "—",
      hint: "Total submitted attempts",
    },
    {
      label: "Active Test",
      value: summary?.activeTest
        ? summary.activeTest.name
        : "None",
      hint: "Current test configuration",
    },
    {
      label: "Users",
      value: summary?.usersCount ?? "—",
      hint: "Registered accounts",
    },
  ];
}, [summary]);


  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/me", { cache: "no-store" });
        const text = await res.text();
        const json = text ? JSON.parse(text) : null;

        if (!res.ok) {
          setError(json?.message || "Access denied");
          window.location.href = "/admin/login";
          return;
        }

        setOk(true);
      } catch {
        window.location.href = "/admin/login";
      }
    })();

    (async () => {
        const res = await fetch("/api/admin/summary", { cache: "no-store" });
        console.log("response for summary",JSON.stringify(res))
        if (!res.ok) return;
        const json = await res.json();
        setSummary(json);
    })();
    
  }, []);

  return (
    <div className={`${styles.adminBg} ${styles.page}`}>

      <main className={styles.container}>
        <header className={styles.hero}>
          <div>
            <h1 className={styles.title}>Admin Control Panel</h1>
            <p className={styles.subTitle}>
              Secure management workspace for SkillTrajectory. Only authorised administrators can access
              platform configuration, question bank management, and analytics.
            </p>
          </div>

          <div className={styles.pill}>Role: ADMIN</div>
        </header>

        {error && <div className={styles.error}>{error}</div>}

        {ok && (
          <div className={styles.grid}>
            {/* LEFT: Overview */}
            <section className={styles.card}>
              <div className={styles.cardInner}>
                <h2 className={styles.sectionTitle}>Overview</h2>
                <div className={styles.sectionMeta}>Access confirmed. Admin session validated.</div>

                <div className={styles.kpis}>
                  {kpis.map((k) => (
                    <div key={k.label} className={styles.kpi}>
                      <div className={styles.kpiLabel}>{k.label}</div>
                      <div className={styles.kpiValue}>{k.value}</div>
                      <div className={styles.kpiHint}>{k.hint}</div>
                    </div>
                  ))}
                </div>

                <div className={styles.actions}>
                  <Link href="/admin/questions" className={styles.btnPrimary}>
                    Manage Questions <span style={{ opacity: 0.85 }}>→</span>
                  </Link>

                    <Link href="/admin/analytics" className={styles.btnGhost}>
                    View Analytics
                    </Link>

                    {/* <button className={styles.btnDanger} onClick={handleAdminLogout}>
                      Logout (Admin)
                    </button> */}



                  <Link href="/dashboard" className={styles.btnGhost}>
                    Back to User Dashboard
                  </Link>
                </div>

                <div style={{ marginTop: 12, fontSize: 12, opacity: 0.75, color: "rgba(255,255,255,0.78)" }}>
                  Tip: Keep question tags consistent (topic_tag + section) to improve gap analysis accuracy.
                </div>
              </div>
            </section>

            {/* RIGHT: Next steps / Admin actions */}
            <aside className={styles.card}>
              <div className={styles.cardInner}>
                <h2 className={styles.sectionTitle}>Admin Actions</h2>
                <div className={styles.sectionMeta}>Recommended next tasks for platform setup.</div>

                <div className={styles.list}>
                  <div className={styles.item}>
                    <p className={styles.itemTitle}>Question Bank</p>
                    <div className={styles.itemMeta}>
                      Create, edit, tag, and activate questions for each section. Strong tagging improves analytics outputs.
                    </div>
                  </div>

                  <div className={styles.item}>
                    <p className={styles.itemTitle}>Test Configuration</p>
                    <div className={styles.itemMeta}>
                      Maintain an “active test” so users can start attempts consistently. Ensure duration + sections are configured.
                    </div>
                  </div>

                  <div className={styles.item}>
                    <p className={styles.itemTitle}>Platform Analytics</p>
                    <div className={styles.itemMeta}>
                      Review scores distribution, weak topic frequency, and completion rate to improve question quality.
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

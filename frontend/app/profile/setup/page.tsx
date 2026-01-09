"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./profileSetup.module.css";

type Profile = {
  user_id: number;
  target_role: string;
  experience_level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  daily_study_minutes?: number | null;
  updated_at?: string;
};

const roleOptions = [
  "Software Engineer",
  "Full Stack Developer",
  "Backend Developer",
  "Frontend Developer",
  "DevOps Engineer",
  "QA Engineer",
  "Data Analyst",
  "Project Manager (Tech)",
];

const expOptions = [
  {
    value: "BEGINNER" as const,
    title: "Beginner",
    desc: "0–1 year. Focus on fundamentals and consistency.",
  },
  {
    value: "INTERMEDIATE" as const,
    title: "Intermediate",
    desc: "1–3 years. Build depth and improve problem-solving speed.",
  },
  {
    value: "ADVANCED" as const,
    title: "Advanced",
    desc: "3+ years. Strengthen architecture, optimisation, and leadership skills.",
  },
];

export default function ProfileSetupPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [targetRole, setTargetRole] = useState("");
  const [experience, setExperience] = useState<Profile["experience_level"] | "">("");

  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const completion = useMemo(() => {
    let score = 0;
    if (targetRole) score += 50;
    if (experience) score += 50;
    return score;
  }, [targetRole, experience]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/profile", { method: "GET" });

        if (!res.ok) {
          window.location.href = "/login";
          return;
        }

        const data = await res.json();
        const p: Profile | null = data?.profile || null;

        if (p) {
          setTargetRole(p.target_role || "");
          setExperience(p.experience_level || "");
        }
      } catch {
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!targetRole) {
      setMsg({ type: "error", text: "Please select your target role." });
      return;
    }
    if (!experience) {
      setMsg({ type: "error", text: "Please select your experience level." });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_role: targetRole,
          experience_level: experience,
        }),
      });

      const text = await res.text();
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch {}

      if (!res.ok) {
        setMsg({ type: "error", text: data?.message || "Failed to save profile." });
        return;
      }

      setMsg({ type: "success", text: data?.message || "Profile saved successfully." });
    } catch (err: any) {
      setMsg({ type: "error", text: String(err?.message || "Failed to save profile.") });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className={styles.wrapper}>
      <div className={styles.header}>
        <div className="app-bg">
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Profile Setup</h1>
          <p className={styles.subtitle}>
            Set your career goal and experience level. This unlocks personalised recommendations, test selection and study planning.
          </p>
        </div>
        </div>

        <div className={styles.actions}>
          <Link className={styles.button} href="/dashboard">Dashboard</Link>
          <button className={`${styles.button} ${styles.primary}`} onClick={(e) => onSave(e as any)} disabled={saving || loading}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className={`glass ${styles.card}`}>
          <div className={styles.cardTitleRow}>
            <h2 className={styles.cardTitle}>Loading</h2>
            <span className={styles.pill}>Fetching profile</span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.70)" }}>Please wait…</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {/* LEFT: Form */}
          <section className={`glass ${styles.card}`}>
            <div className={styles.cardTitleRow}>
              <h2 className={styles.cardTitle}>Personalisation</h2>
              <span className={styles.pill}>Completion: {completion}%</span>
            </div>

            <form onSubmit={onSave}>
              <div className={styles.field}>
                <div className={styles.label}>Target role</div>
                <select
                  className={styles.select}
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                >
                  <option value="">Select a target role…</option>
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <div className={styles.label}>Experience level</div>
                <div className={styles.radioGrid}>
                  {expOptions.map((x) => (
                    <label key={x.value} className={styles.radioCard}>
                      <input
                        type="radio"
                        name="experience"
                        value={x.value}
                        checked={experience === x.value}
                        onChange={() => setExperience(x.value)}
                        style={{ marginTop: 3 }}
                      />
                      <div>
                        <p className={styles.radioTitle}>{x.title}</p>
                        <p className={styles.radioDesc}>{x.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.footer}>
                <button
                  className={`${styles.button} ${styles.primary}`}
                  type="submit"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save profile"}
                </button>

                <Link className={styles.button} href="/test/start">
                  Start Test (next)
                </Link>
              </div>

              {msg && (
                <div
                  className={`${styles.message} ${
                    msg.type === "error" ? styles.messageError : styles.messageSuccess
                  }`}
                >
                  {msg.text}
                </div>
              )}
            </form>
          </section>

          {/* RIGHT: Summary / What this affects */}
          <aside className={`glass ${styles.card}`}>
            <div className={styles.cardTitleRow}>
              <h2 className={styles.cardTitle}>What this affects</h2>
              <span className={styles.pill}>Why it matters</span>
            </div>

            <div className={styles.kv}>
              <div className={styles.kvRow}>
                <span className={styles.k}>Recommendations</span>
                <span className={styles.v}>Personalised topics</span>
              </div>
              <div className={styles.kvRow}>
                <span className={styles.k}>Tests</span>
                <span className={styles.v}>Better-fit difficulty</span>
              </div>
              <div className={styles.kvRow}>
                <span className={styles.k}>Study Plan</span>
                <span className={styles.v}>Role-aligned roadmap</span>
              </div>
              <div className={styles.kvRow}>
                <span className={styles.k}>Analytics</span>
                <span className={styles.v}>More accurate insights</span>
              </div>
            </div>

            <div style={{ height: 14 }} />

            <div style={{ color: "rgba(255,255,255,0.70)", fontSize: 13, lineHeight: 1.6 }}>
              After you save your profile, the dashboard will gradually populate with attempt history, readiness level and skill gaps as you complete tests.
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

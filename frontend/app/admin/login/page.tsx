"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./adminLogin.module.css";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (!res.ok) {
        setMsg(json?.message || "Admin login failed");
        return;
      }

      window.location.href = "/admin";
    } catch {
      setMsg("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        {/* LEFT: Form */}
        <section className={styles.left}>
          <div className={styles.leftInner}>
            <div className={styles.brandRow}>
              <div>
                <h1 className={styles.brandTitle}>Admin Login</h1>
                <p className={styles.brandSub}>
                  Restricted access area for managing SkillTrajectory. This interface is protected by role-based access control.
                </p>
              </div>
              <div className={styles.pill}>ADMIN ONLY</div>
            </div>

            {msg && <div className={styles.msg}>{msg}</div>}

            <form onSubmit={onSubmit} className={styles.form}>
              <div className={styles.field}>
                <div className={styles.label}>Email</div>
                <input
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  placeholder="admin@skilltrajectory.com"
                />
              </div>

              <div className={styles.field}>
                <div className={styles.label}>Password</div>
                <input
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  placeholder="Enter your password"
                />
              </div>

              <button className={styles.btnPrimary} disabled={loading}>
                {loading ? "Signing in..." : "Login as Admin"}
                <span style={{ opacity: 0.85 }}>→</span>
              </button>
            </form>

            <div className={styles.links}>
              <Link href="/login" className={styles.link}>User Login</Link>
              <Link href="/dashboard" className={styles.link}>Back to Dashboard</Link>
            </div>
          </div>
        </section>

        {/* RIGHT: Info panel */}
        <aside className={styles.right}>
          <h2 className={styles.cardTitle}>Security & Governance</h2>
          <div className={styles.cardMeta}>
            Administrative features are protected using secure session cookies and role-based access control (RBAC).
          </div>

          <div className={styles.list}>
            <div className={styles.item}>
              <p className={styles.itemTitle}>RBAC Enforcement</p>
              <div className={styles.itemMeta}>
                Only users with role = ADMIN can access admin routes and dashboards.
              </div>
            </div>

            <div className={styles.item}>
              <p className={styles.itemTitle}>HttpOnly Session Cookie</p>
              <div className={styles.itemMeta}>
                Session token is stored securely to reduce client-side exposure and mitigate XSS risks.
              </div>
            </div>

            <div className={styles.item}>
              <p className={styles.itemTitle}>Audit-Friendly Workflow</p>
              <div className={styles.itemMeta}>
                Admin access is isolated from user flows, improving safety and clarity for platform governance.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

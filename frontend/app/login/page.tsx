"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./login.module.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!emailRegex.test(email)) {
      setMsg({ type: "error", text: "Please enter a valid email address." });
      return;
    }
    if (!password) {
      setMsg({ type: "error", text: "Password is required." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch {}

      if (!res.ok) {
        setMsg({ type: "error", text: data?.message || "Invalid login" });
        return;
      }

      setMsg({ type: "success", text: data?.message || "Login successful" });

      // For S02 we just confirm session; redirect can be S03 (dashboard)
      // window.location.href = "/dashboard";
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.blob} ${styles.blob1}`} />
      <div className={`${styles.blob} ${styles.blob2}`} />

      <main className={styles.card}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>
          Log in to view your dashboard and test history.
        </p>

        <form className={styles.form} onSubmit={onSubmit}>
          <div>
            <div className={styles.label}>Email</div>
            <input
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <div className={styles.label}>Password</div>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
            />
          </div>

          <button className={styles.button} disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>

          {msg && (
            <div className={`${styles.message} ${msg.type === "error" ? styles.messageError : styles.messageSuccess}`}>
              {msg.text}
            </div>
          )}

          <div className={styles.footer}>
            <span>
              New here? <Link className={styles.link} href="/register">Register</Link>
            </span>
            <Link className={styles.link} href="/">Home</Link>
          </div>
        </form>
      </main>
    </div>
  );
}

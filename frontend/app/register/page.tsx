"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "./register.module.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Msg = { type: "success" | "error"; text: string } | null;

function passwordStrength(pw: string): "Weak" | "Okay" | "Strong" {
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasNum = /\d/.test(pw);
  const hasSym = /[^A-Za-z0-9]/.test(pw);
  const score = [hasLower, hasUpper, hasNum, hasSym].filter(Boolean).length;

  if (pw.length < 8) return "Weak";
  if (pw.length >= 10 && score >= 3) return "Strong";
  return "Okay";
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  const strength = useMemo(() => passwordStrength(password), [password]);
  const strengthClass =
    strength === "Weak" ? styles.strengthWeak : strength === "Strong" ? styles.strengthStrong : styles.strengthOk;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    // Client-side validation (AC)
    if (!emailRegex.test(email)) {
      setMsg({ type: "error", text: "Please enter a valid email address." });
      return;
    }
    if (password.length < 8) {
      setMsg({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }

    setLoading(true);
    try {
      // Call NEXT API route (same-origin)
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || null, email, password }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        // ignore
      }

      if (!res.ok) {
        const backendMsg = data?.message || text || "Registration failed";
        if (String(backendMsg).toLowerCase().includes("already")) {
          setMsg({ type: "error", text: "This email is already registered. Please log in instead." });
        } else {
          setMsg({ type: "error", text: backendMsg });
        }
        return;
      }

      setMsg({ type: "success", text: data?.message || "Registration successful. You can now login." });
      setName("");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setMsg({ type: "error", text: String(err?.message || "Registration failed") });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.blob} ${styles.blob1}`} />
      <div className={`${styles.blob} ${styles.blob2}`} />
      <div className={`${styles.blob} ${styles.blob3}`} />

      <main className={styles.card}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          SkillTrajectory • New Account
        </div>

        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>
          Start with a quick registration. You’ll unlock aptitude tests, skill-gap insights, and a personalised study plan.
        </p>

        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.gridTwo}>
            <div className={styles.inputWrap}>
              <div className={styles.label}>Name (optional)</div>
              <input
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Samiksha"
                autoComplete="name"
              />
            </div>

            <div className={styles.inputWrap}>
              <div className={styles.label}>Email</div>
              <input
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className={styles.inputWrap}>
            <div className={styles.label}>Password</div>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
            />
            <div className={styles.helperRow}>
              <span className={styles.hint}>Tip: use upper, lower, number, symbol.</span>
              <span className={`${styles.strength} ${strengthClass}`}>Strength: {strength}</span>
            </div>
          </div>

          <button className={styles.button} disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>

          {msg && (
            <div
              className={`${styles.message} ${
                msg.type === "error" ? styles.messageError : styles.messageSuccess
              }`}
            >
              {msg.text}
            </div>
          )}

          <div className={styles.footer}>
            <span>
              Already registered? <Link className={styles.link} href="/login">Login</Link>
            </span>
            <Link className={styles.link} href="/">Home</Link>
          </div>
        </form>
      </main>
    </div>
  );
}

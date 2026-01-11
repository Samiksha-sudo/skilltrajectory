"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./questions.module.css";

type Question = {
  id: number;
  section: string;
  topic_tag: string;
  difficulty: string;
  question_text: string;
  options_json: any; // array typically
  correct_option: string;
  is_active: boolean;
  created_at?: string;
};

type FormState = {
  id?: number;
  section: string;
  topic_tag: string;
  difficulty: string;
  question_text: string;
  options: string[];
  correct_option: string; // "A" | "B" | "C" | "D"
  is_active: boolean;
};

const DEFAULT_FORM: FormState = {
  section: "APTITUDE",
  topic_tag: "",
  difficulty: "EASY",
  question_text: "",
  options: ["", "", "", ""],
  correct_option: "A",
  is_active: true,
};

function safeArray(v: any): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x ?? ""));
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed.map((x) => String(x ?? ""));
    } catch {}
  }
  return [];
}

export default function AdminQuestionsPage() {
  const [items, setItems] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filters
  const [q, setQ] = useState("");
  const [section, setSection] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [active, setActive] = useState(""); // "", "true", "false"

  // modal
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<FormState>({ ...DEFAULT_FORM });
  const [saving, setSaving] = useState(false);
  const [modalMsg, setModalMsg] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (section) sp.set("section", section);
    if (difficulty) sp.set("difficulty", difficulty);
    if (active) sp.set("active", active);
    return sp.toString();
  }, [q, section, difficulty, active]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/questions?${queryString}`, { cache: "no-store" });
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (!res.ok) {
        setError(json?.message || "Failed to load questions");
        setItems([]);
        return;
      }

      setItems(Array.isArray(json?.items) ? json.items : []);
    } catch (e: any) {
      setError(String(e?.message || e));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  function openCreate() {
    setMode("create");
    setForm({ ...DEFAULT_FORM });
    setModalMsg(null);
    setOpen(true);
  }

  function openEdit(row: Question) {
    const options = safeArray(row.options_json);
    const normalized = options.length ? options : ["", "", "", ""];
    setMode("edit");
    setForm({
      id: row.id,
      section: row.section || "APTITUDE",
      topic_tag: row.topic_tag || "",
      difficulty: row.difficulty || "EASY",
      question_text: row.question_text || "",
      options: normalized.length >= 2 ? normalized : ["", "", "", ""],
      correct_option: row.correct_option || "A",
      is_active: !!row.is_active,
    });
    setModalMsg(null);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setModalMsg(null);
  }

  function validateForm(): string | null {
    if (!form.section) return "Section is required.";
    if (!form.topic_tag.trim()) return "Topic tag is required.";
    if (!form.difficulty) return "Difficulty is required.";
    if (!form.question_text.trim()) return "Question text is required.";

    const cleanedOptions = form.options.map((x) => x.trim()).filter(Boolean);
    if (cleanedOptions.length < 2) return "At least 2 options are required.";
    if (cleanedOptions.length !== form.options.length) return "Options cannot be empty (remove unused rows).";

    const allowed = ["A", "B", "C", "D", "E", "F"];
    if (!allowed.includes(form.correct_option)) return "Correct option must be A/B/C/D (or more if you added).";

    const idx = allowed.indexOf(form.correct_option);
    if (idx < 0 || idx >= form.options.length) {
      return "Correct option points to a missing option row.";
    }

    return null;
  }

  async function save() {
    setModalMsg(null);
    const v = validateForm();
    if (v) {
      setModalMsg(v);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        section: form.section,
        topic_tag: form.topic_tag.trim(),
        difficulty: form.difficulty,
        question_text: form.question_text.trim(),
        options_json: form.options.map((x) => x.trim()),
        correct_option: form.correct_option,
        is_active: form.is_active,
      };

      const isEdit = mode === "edit" && form.id != null;

      const res = await fetch(isEdit ? `/api/admin/questions/${form.id}` : `/api/admin/questions`, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (!res.ok) {
        setModalMsg(json?.message || "Failed to save");
        return;
      }

      closeModal();
      await load();
    } catch (e: any) {
      setModalMsg(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  }

  async function deactivate(id: number) {
    const ok = window.confirm("Deactivate this question? (It will be removed from active tests)");
    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (!res.ok) {
        alert(json?.message || "Failed to deactivate");
        return;
      }

      await load();
    } catch {
      alert("Network error");
    }
  }

  function setOption(idx: number, val: string) {
    setForm((p) => {
      const next = [...p.options];
      next[idx] = val;
      return { ...p, options: next };
    });
  }

  function addOptionRow() {
    setForm((p) => ({ ...p, options: [...p.options, ""] }));
  }

  function removeOptionRow(idx: number) {
    setForm((p) => {
      if (p.options.length <= 2) return p; // keep at least 2
      const next = p.options.filter((_, i) => i !== idx);

      // adjust correct_option if out of range
      const letters = ["A", "B", "C", "D", "E", "F", "G"];
      const correctIdx = letters.indexOf(p.correct_option);
      const newCorrect =
        correctIdx >= next.length ? letters[Math.max(0, next.length - 1)] : p.correct_option;

      return { ...p, options: next, correct_option: newCorrect };
    });
  }

  return (
    <div className={styles.page}>
      <main className={styles.container}>
<header className={styles.hero}>
  <div>
    <h1 className={styles.title}>Question Bank</h1>
    <p className={styles.subTitle}>
      Create, update and curate questions by section, topic and difficulty. Changes reflect immediately in tests
      because the assessment engine loads active questions from the database.
    </p>
  </div>

  <div className={styles.heroRight}>
    <div className={styles.pill}>ADMIN</div>
  </div>
</header>

{/* Banner Image */}
<div className={styles.banner}>
  <div className={styles.bannerOverlay} />
  <img className={styles.bannerImg} src="/question.jpg" alt="Question bank banner" />
  <div className={styles.bannerText}>
    <div className={styles.bannerTitle}>Manage Test Content</div>
    <div className={styles.bannerMeta}>
      Add, edit, tag and activate questions to keep assessments relevant and measurable.
    </div>
  </div>
</div>


        <section className={styles.card}>
          <div className={styles.toolbar}>
            <div className={styles.field}>
              <div className={styles.label}>Search</div>
              <input
                className={styles.input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by question text or topic tag..."
              />
            </div>

            <div className={styles.field}>
              <div className={styles.label}>Section</div>
              <select className={styles.select} value={section} onChange={(e) => setSection(e.target.value)}>
                <option value="">All</option>
                <option value="APTITUDE">APTITUDE</option>
                <option value="LOGIC">LOGIC</option>
                <option value="CS">CS</option>
                <option value="CODING">CODING</option>
              </select>
            </div>

            <div className={styles.field}>
              <div className={styles.label}>Difficulty</div>
              <select className={styles.select} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="">All</option>
                <option value="EASY">EASY</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HARD">HARD</option>
              </select>
            </div>

            <div className={styles.field}>
              <div className={styles.label}>Active</div>
              <select className={styles.select} value={active} onChange={(e) => setActive(e.target.value)}>
                <option value="">All</option>
                <option value="true">Active only</option>
                <option value="false">Inactive only</option>
              </select>
            </div>

            <div className={styles.actionsRow}>
              <button className={styles.btnPrimary} onClick={openCreate}>
                + Add Question
              </button>
              <Link href="/admin" className={styles.btnGhost}>
                Back to Admin
              </Link>
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.table}>
            <div className={`${styles.row} ${styles.head}`}>
              <div>ID</div>
              <div>Section</div>
              <div>Topic</div>
              <div>Question</div>
              <div>Status</div>
              <div style={{ textAlign: "right" }}>Actions</div>
            </div>

            {loading && (
              <div className={styles.row}>
                <div style={{ gridColumn: "1 / -1", color: "rgba(255,255,255,0.75)" }}>Loading questions…</div>
              </div>
            )}

            {!loading && !items.length && (
              <div className={styles.row}>
                <div style={{ gridColumn: "1 / -1", color: "rgba(255,255,255,0.75)" }}>
                  No questions found. Add your first question.
                </div>
              </div>
            )}

            {!loading &&
              items.map((row) => (
                <div key={row.id} className={styles.row}>
                  <div>
                    <div className={styles.cellMain}>#{row.id}</div>
                    <div className={styles.cellMeta}>{row.difficulty}</div>
                  </div>

                  <div>
                    <div className={styles.cellMain}>{row.section}</div>
                    <div className={styles.cellMeta}>Correct: {row.correct_option}</div>
                  </div>

                  <div>
                    <div className={styles.cellMain}>{row.topic_tag}</div>
                    <div className={styles.cellMeta}>
                      Options: {safeArray(row.options_json).length || "—"}
                    </div>
                  </div>

                  <div>
                    <div className={styles.cellMain} style={{ fontWeight: 900 }}>
                      {row.question_text?.slice(0, 80)}
                      {row.question_text?.length > 80 ? "…" : ""}
                    </div>
                    <div className={styles.cellMeta}>
                      {row.question_text?.length > 80 ? row.question_text.slice(80, 140) + "…" : ""}
                    </div>
                  </div>

                  <div>
                    <div className={`${styles.badge} ${row.is_active ? styles.badgeOn : styles.badgeOff}`}>
                      {row.is_active ? "Active" : "Inactive"}
                    </div>
                  </div>

                  <div className={styles.miniActions}>
                    <button className={styles.btnGhost} onClick={() => openEdit(row)}>
                      Edit
                    </button>
                    <button className={styles.btnDanger} onClick={() => deactivate(row.id)}>
                      Deactivate
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Modal */}
        {open && (
          <div className={styles.backdrop} onMouseDown={closeModal}>
            <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
              <div className={styles.modalTop}>
                <h3 className={styles.modalTitle}>
                  {mode === "create" ? "Add New Question" : `Edit Question #${form.id}`}
                </h3>
                <button className={styles.btnGhost} onClick={closeModal}>
                  Close
                </button>
              </div>

              <div className={styles.modalBody}>
                {modalMsg && <div className={styles.error}>{modalMsg}</div>}

                <div className={styles.modalGrid}>
                  <div className={styles.field}>
                    <div className={styles.label}>Section</div>
                    <select
                      className={styles.select}
                      value={form.section}
                      onChange={(e) => setForm((p) => ({ ...p, section: e.target.value }))}
                    >
                      <option value="APTITUDE">APTITUDE</option>
                      <option value="LOGIC">LOGIC</option>
                      <option value="CS">CS</option>
                      <option value="CODING">CODING</option>
                    </select>
                  </div>

                  <div className={styles.field}>
                    <div className={styles.label}>Difficulty</div>
                    <select
                      className={styles.select}
                      value={form.difficulty}
                      onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value }))}
                    >
                      <option value="EASY">EASY</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HARD">HARD</option>
                    </select>
                  </div>

                  <div className={styles.field}>
                    <div className={styles.label}>Active</div>
                    <select
                      className={styles.select}
                      value={String(form.is_active)}
                      onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.value === "true" }))}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>Topic Tag</div>
                  <input
                    className={styles.input}
                    value={form.topic_tag}
                    onChange={(e) => setForm((p) => ({ ...p, topic_tag: e.target.value }))}
                    placeholder="e.g., Percentages, Arrays, OOP, SQL-Joins"
                  />
                  <div className={styles.smallHint} style={{ marginTop: 6 }}>
                    Tip: Keep tags consistent across questions for accurate skill gap analysis.
                  </div>
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>Question Text</div>
                  <textarea
                    className={styles.textarea}
                    value={form.question_text}
                    onChange={(e) => setForm((p) => ({ ...p, question_text: e.target.value }))}
                    placeholder="Write the question clearly. Avoid ambiguity."
                  />
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>Options</div>
                  <div className={styles.optionsWrap} style={{ marginTop: 10 }}>
                    {form.options.map((opt, idx) => (
                      <div key={idx} className={styles.optionRow}>
                        <input
                          className={styles.input}
                          value={opt}
                          onChange={(e) => setOption(idx, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        />
                        <button className={styles.btnDanger} onClick={() => removeOptionRow(idx)} type="button">
                          Remove
                        </button>
                      </div>
                    ))}
                    <div className={styles.smallHint}>
                      Correct option letter must match one of the option rows (A, B, C, D...).
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button className={styles.btnGhost} onClick={addOptionRow} type="button">
                        + Add option row
                      </button>
                    </div>
                  </div>
                </div>

                <div className={styles.field}>
                  <div className={styles.label}>Correct Option</div>
                  <select
                    className={styles.select}
                    value={form.correct_option}
                    onChange={(e) => setForm((p) => ({ ...p, correct_option: e.target.value }))}
                  >
                    {form.options.map((_, idx) => {
                      const letter = String.fromCharCode(65 + idx);
                      return (
                        <option key={letter} value={letter}>
                          {letter}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className={styles.footer}>
                <div className={styles.smallHint}>
                  Saving updates the question bank immediately. Active questions will appear in tests.
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button className={styles.btnGhost} onClick={closeModal} disabled={saving}>
                    Cancel
                  </button>
                  <button className={styles.btnPrimary} onClick={save} disabled={saving}>
                    {saving ? "Saving..." : mode === "create" ? "Create Question" : "Save Changes"}
                    <span style={{ opacity: 0.85 }}>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

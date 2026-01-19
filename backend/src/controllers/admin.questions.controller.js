import { Question } from "../db.js";

function normalizeOptions(options_json) {
  // allow array or JSON string
  if (Array.isArray(options_json)) return options_json;
  if (typeof options_json === "string") {
    try {
      const parsed = JSON.parse(options_json);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return null;
}

export async function listQuestions(req, res) {
  const { q, section, difficulty, active } = req.query;

  const where = {};
  if (section) where.section = section;
  if (difficulty) where.difficulty = difficulty;
  if (active === "true") where.is_active = true;
  if (active === "false") where.is_active = false;

  // basic search by question text/topic
  if (q) {
    // MySQL LIKE search (Sequelize)
    const { Op } = await import("sequelize");
    where[Op.or] = [
      { question_text: { [Op.like]: `%${q}%` } },
      { topic_tag: { [Op.like]: `%${q}%` } },
    ];
  }

  const rows = await Question.findAll({
    where,
    order: [["id", "DESC"]],
    limit: 500,
  });

  res.json({ items: rows });
}

export async function getQuestion(req, res) {
  const id = Number(req.params.id);
  const row = await Question.findByPk(id);
  if (!row) return res.status(404).json({ message: "Question not found" });
  res.json({ item: row });
}

export async function createQuestion(req, res) {
  const {
    section,
    topic_tag,
    difficulty,
    question_text,
    options_json,
    correct_option,
    is_active,
  } = req.body || {};

  if (!section || !topic_tag || !difficulty || !question_text || !correct_option) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const opts = normalizeOptions(options_json);
  if (!opts || opts.length < 2) {
    return res.status(400).json({ message: "options_json must be an array (min 2 options)" });
  }

  const created = await Question.create({
    section,
    topic_tag,
    difficulty,
    question_text,
    options_json: opts,
    correct_option,
    is_active: is_active !== undefined ? !!is_active : true,
    created_at: new Date(),
  });

  res.status(201).json({ message: "Created", item: created });
}

export async function updateQuestion(req, res) {
  const id = Number(req.params.id);
  const row = await Question.findByPk(id);
  if (!row) return res.status(404).json({ message: "Question not found" });

  const patch = req.body || {};

  if (patch.options_json !== undefined) {
    const opts = normalizeOptions(patch.options_json);
    if (!opts || opts.length < 2) {
      return res.status(400).json({ message: "options_json must be an array (min 2 options)" });
    }
    patch.options_json = opts;
  }

  await row.update(patch);
  res.json({ message: "Updated", item: row });
}

export async function deleteQuestion(req, res) {
  const id = Number(req.params.id);
  const row = await Question.findByPk(id);
  if (!row) return res.status(404).json({ message: "Question not found" });

  // Prefer soft delete for dissertation + audit
  // Set inactive instead of hard delete
  await row.update({ is_active: false });

  res.json({ message: "Deactivated (soft delete)" });
}

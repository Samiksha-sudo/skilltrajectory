import { Attempt, Test, Question ,AttemptAnswer, AttemptScore } from "../db.js";

export async function startAttempt(req, res) {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: "Unauthenticated" });

    const test = await Test.findOne({ where: { is_active: true } });
    if (!test) return res.status(404).json({ message: "No active test found" });

    const attempt = await Attempt.create({
      user_id: userId,
      test_id: test.id,
      started_at: new Date(),
      status: "STARTED",
    });

    return res.status(201).json({
      message: "Attempt started",
      attemptId: attempt.id,
      test: { id: test.id, duration_minutes: test.duration_minutes, name: test.name },
    });
  } catch (err) {
    console.error("startAttempt error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function submitAttempt(req, res) {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: "Unauthenticated" });

    const attemptId = Number(req.params.id);
    if (!Number.isInteger(attemptId)) return res.status(400).json({ message: "Invalid attemptId" });

    const attempt = await Attempt.findByPk(attemptId);
    if (!attempt || attempt.user_id !== userId) return res.status(404).json({ message: "Attempt not found" });

    if (attempt.status === "SUBMITTED") {
      return res.status(200).json({ message: "Already submitted", attemptId });
    }

    // Load answers + related questions
    const answers = await AttemptAnswer.findAll({ where: { attempt_id: attemptId } });
    const qIds = answers.map(a => a.question_id);
    const questions = qIds.length
      ? await Question.findAll({ where: { id: qIds } })
      : [];

    const qMap = new Map(questions.map(q => [q.id, q]));
    let correct = 0;

    for (const a of answers) {
      const q = qMap.get(a.question_id);
      const isCorrect = q?.correct_option != null && String(a.selected_option) === String(q.correct_option);
      if (isCorrect) correct += 1;

      await AttemptAnswer.update(
        { is_correct: isCorrect ? 1 : 0 },
        { where: { id: a.id } }
      );
    }

    const maxScore = questions.length; // 1 point per question
    const accuracyPct = maxScore > 0 ? Number(((correct / maxScore) * 100).toFixed(2)) : null;

    // upsert attempt_scores
    const existingScore = await AttemptScore.findByPk(attemptId);
    if (!existingScore) {
      await AttemptScore.create({
        attempt_id: attemptId,
        total_score: correct,
        max_score: maxScore,
        accuracy_pct: accuracyPct,
        computed_at: new Date(),
      });
    } else {
      await AttemptScore.update(
        { total_score: correct, max_score: maxScore, accuracy_pct: accuracyPct, computed_at: new Date() },
        { where: { attempt_id: attemptId } }
      );
    }

    const { elapsedSec } = req.body || {};
    const safeElapsed = Number.isInteger(Number(elapsedSec)) && Number(elapsedSec) >= 0 ? Number(elapsedSec) : null;

    await Attempt.update(
      { submitted_at: new Date(), total_time_sec: safeElapsed, status: "SUBMITTED" },
      { where: { id: attemptId } }
    );

    return res.status(200).json({
      message: "Test submitted successfully",
      attemptId,
      score: { total: correct, max: maxScore, pct: accuracyPct },
    });
  } catch (err) {
    console.error("submitAttempt error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function saveAnswer(req, res) {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: "Unauthenticated" });

    const attemptId = Number(req.params.id);
    if (!Number.isInteger(attemptId)) return res.status(400).json({ message: "Invalid attemptId" });

    const attempt = await Attempt.findByPk(attemptId);
    if (!attempt || attempt.user_id !== userId) return res.status(404).json({ message: "Attempt not found" });
    if (attempt.status === "SUBMITTED") return res.status(409).json({ message: "Attempt already submitted" });

    const { questionId, selectedOption } = req.body || {};
    const qid = Number(questionId);
    if (!Number.isInteger(qid)) return res.status(400).json({ message: "Invalid questionId" });

    const q = await Question.findByPk(qid);
    if (!q) return res.status(404).json({ message: "Question not found" });

    // upsert answer for (attempt_id, question_id)
    const existing = await AttemptAnswer.findOne({ where: { attempt_id: attemptId, question_id: qid } });
    if (!existing) {
      await AttemptAnswer.create({
        attempt_id: attemptId,
        question_id: qid,
        selected_option: String(selectedOption),
      });
    } else {
      await AttemptAnswer.update(
        { selected_option: String(selectedOption) },
        { where: { id: existing.id } }
      );
    }

    return res.status(200).json({ message: "Answer saved" });
  } catch (err) {
    console.error("saveAnswer error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getAttemptQuestions(req, res) {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: "Unauthenticated" });

    const attemptId = Number(req.params.id);
    const section = req.query.section;

    if (!Number.isInteger(attemptId)) {
      return res.status(400).json({ message: "Invalid attemptId" });
    }

    const attempt = await Attempt.findByPk(attemptId);
    if (!attempt || attempt.user_id !== userId) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    const where = { is_active: 1 };
    if (section) where.section = section;

    const questions = await Question.findAll({
      where,
      attributes: ["id", "section", "question_text", "options_json"],
      order: [["id", "ASC"]],
    });

    return res.status(200).json({
      attemptId,
      section,
      questions,
    });
  } catch (err) {
    console.error("getAttemptQuestions error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

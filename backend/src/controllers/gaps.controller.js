import { Attempt, AttemptAnswer, Question } from "../db.js";

export async function getSkillGaps(req, res) {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: "Unauthenticated" });

    const attemptId = Number(req.params.id);
    if (!Number.isInteger(attemptId)) {
      return res.status(400).json({ message: "Invalid attemptId" });
    }

    const attempt = await Attempt.findByPk(attemptId);
    if (!attempt || attempt.user_id !== userId) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    // Load answers for this attempt
    const answers = await AttemptAnswer.findAll({
      where: { attempt_id: attemptId },
      attributes: ["question_id", "is_correct"],
    });

    if (!answers.length) {
      return res.status(200).json({
        attemptId,
        weakTopics: [],
        strengths: [],
        message: "No answers found for this attempt yet.",
      });
    }

    // Load questions to get topic_tag
    const qIds = answers.map((a) => a.question_id);
    const questions = await Question.findAll({
      where: { id: qIds },
      attributes: ["id", "topic_tag", "section"],
    });

    const qMap = new Map(questions.map((q) => [q.id, q]));

    // Aggregate by topic_tag
    const agg = new Map(); // topic_tag => { topic_tag, total, correct, sectionCounts }
    for (const a of answers) {
      const q = qMap.get(a.question_id);
      const topic = q?.topic_tag || "UNSPECIFIED";
      const isCorrect = a.is_correct === true || a.is_correct === 1;

      if (!agg.has(topic)) {
        agg.set(topic, { topic_tag: topic, total: 0, correct: 0, sections: new Set() });
      }

      const row = agg.get(topic);
      row.total += 1;
      row.correct += isCorrect ? 1 : 0;
      if (q?.section) row.sections.add(q.section);
    }

    // Build metrics
    const topics = Array.from(agg.values()).map((t) => {
      const accuracy = t.total > 0 ? t.correct / t.total : 0;
      const gapScore = 1 - accuracy; // higher = weaker
      return {
        topic_tag: t.topic_tag,
        total: t.total,
        correct: t.correct,
        accuracy_pct: Number((accuracy * 100).toFixed(2)),
        gap_score: Number(gapScore.toFixed(3)),
        sections: Array.from(t.sections),
      };
    });

    // Define weak vs strengths thresholds (simple, explainable)
    // Weak: accuracy < 60%
    // Strength: accuracy >= 80%
    const weakTopics = topics
      .filter((t) => t.accuracy_pct < 60)
      .sort((a, b) => b.gap_score - a.gap_score);

    const strengths = topics
      .filter((t) => t.accuracy_pct >= 80)
      .sort((a, b) => b.accuracy_pct - a.accuracy_pct);

    return res.status(200).json({
      attemptId,
      weakTopics,
      strengths,
      allTopics: topics, // useful for charts later
      thresholds: { weak_below: 60, strength_from: 80 },
    });
  } catch (err) {
    console.error("getSkillGaps error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

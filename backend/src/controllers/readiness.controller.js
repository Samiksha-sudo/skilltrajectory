import { Attempt, AttemptScore, ReadinessResult } from "../db.js";
import { calculateReadiness } from "../services/readiness.service.js";

export async function getReadiness(req, res) {
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

    // If already computed, return it
    const existing = await ReadinessResult.findByPk(attemptId);
    if (existing) {
      return res.status(200).json({
        attemptId,
        readiness_level: existing.readiness_level,
        confidence_score: existing.confidence_score,
        explanation: existing.explanation_json,
        computed_at: existing.computed_at,
      });
    }

    // Compute from attempt_scores
    const score = await AttemptScore.findByPk(attemptId);
    if (!score) {
      return res.status(409).json({
        message: "Readiness cannot be computed until scoring is available for this attempt.",
      });
    }

    const computed = calculateReadiness({
      totalScore: score.total_score,
      maxScore: score.max_score,
      accuracyPct: score.accuracy_pct,
      avgTimePerQ: score.avg_time_per_q,
    });

    await ReadinessResult.create({
      attempt_id: attemptId,
      readiness_level: computed.readiness_level,
      confidence_score: computed.confidence_score,
      explanation_json: computed.explanation,
      computed_at: new Date(),
    });

    return res.status(200).json({
      attemptId,
      readiness_level: computed.readiness_level,
      confidence_score: computed.confidence_score,
      explanation: computed.explanation,
      computed_at: new Date(),
    });
  } catch (err) {
    console.error("getReadiness error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

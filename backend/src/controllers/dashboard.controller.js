import { Attempt, AttemptScore, ReadinessResult, Test } from "../db.js";

export async function getDashboardSummary(req, res) {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: "Unauthenticated" });

    // Attempts count
    const attemptsCount = await Attempt.count({ where: { user_id: userId } });

    // Recent attempts (latest 5)
    const recentAttempts = await Attempt.findAll({
      where: { user_id: userId },
      order: [["started_at", "DESC"]],
      limit: 5,
    });

    // Best score (if scoring exists)
    // We join via attempt_id (manual approach: query scores for user's attempts)
    const attemptIds = recentAttempts.map(a => a.id);

    // For best score across all attempts: get user's attempt IDs first
    // Simple approach: compute from scores table using a subquery is ideal, but Sequelize basic is fine:
    const allAttempts = await Attempt.findAll({
      where: { user_id: userId },
      attributes: ["id"],
      order: [["id", "DESC"]],
      limit: 500, // enough for your project
    });

    const allAttemptIds = allAttempts.map(a => a.id);

    let bestScore = null;
    let bestScorePct = null;

    if (allAttemptIds.length) {
      const best = await AttemptScore.findOne({
        where: { attempt_id: allAttemptIds },
        order: [["total_score", "DESC"]],
      });

      if (best?.total_score != null) {
        bestScore = best.total_score;
        if (best.max_score) bestScorePct = Math.round((best.total_score / best.max_score) * 100);
      }
    }

    // Latest readiness (if exists)
    let readiness = null;

    if (allAttemptIds.length) {
      const latestReady = await ReadinessResult.findOne({
        where: { attempt_id: allAttemptIds },
        order: [["computed_at", "DESC"]],
      });

      if (latestReady) {
        readiness = {
          level: latestReady.readiness_level,
          confidence: latestReady.confidence_score,
        };
      }
    }

    // Map recent activity with optional score if available
    let recentActivity = [];
    if (recentAttempts.length) {
      const recentIds = recentAttempts.map(a => a.id);
      const scores = await AttemptScore.findAll({ where: { attempt_id: recentIds } });
      const scoreMap = new Map(scores.map(s => [s.attempt_id, s]));

      recentActivity = recentAttempts.map(a => {
        const sc = scoreMap.get(a.id);
        return {
          attemptId: a.id,
          status: a.status,
          startedAt: a.started_at,
          submittedAt: a.submitted_at,
          scorePct:
            sc?.total_score != null && sc?.max_score
              ? Math.round((sc.total_score / sc.max_score) * 100)
              : null,
        };
      });
    }

    return res.status(200).json({
      attemptsCount,
      bestScorePct,     // null until scoring is implemented
      readiness,        // null until readiness sprint
      recentActivity,   // shows attempts even without score
    });
  } catch (err) {
    console.error("getDashboardSummary error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

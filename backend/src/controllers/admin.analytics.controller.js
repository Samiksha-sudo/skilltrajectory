import { sequelize, User, Attempt, AttemptScore, SkillGap } from "../db.js";

export async function adminAnalyticsSummary(req, res) {
  try {
    // 1) Users
    const usersCount = await User.count();

    // 2) Attempts + completion
    const attemptsCount = await Attempt.count();
    const submittedCount = await Attempt.count({ where: { status: "SUBMITTED" } });
    const completionRatePct =
      attemptsCount > 0 ? Math.round((submittedCount / attemptsCount) * 100) : 0;

    // 3) Average score (percentage) across all scored attempts
    // AttemptScore.accuracy_pct or compute (total_score/max_score)*100
    // We'll compute score_pct safely from total/max if needed.
    const [avgScoreRow] = await sequelize.query(`
      SELECT
        AVG(
          CASE
            WHEN max_score IS NULL OR max_score = 0 OR total_score IS NULL THEN NULL
            ELSE (total_score / max_score) * 100
          END
        ) AS avgScorePct
      FROM attempt_scores;
    `);

    const avgScorePct =
      avgScoreRow?.[0]?.avgScorePct != null ? Number(avgScoreRow[0].avgScorePct).toFixed(1) : null;

    // 4) Trend: last 7 days submissions count + avg score
    const [trendRows] = await sequelize.query(`
      SELECT
        DATE(a.submitted_at) AS day,
        COUNT(*) AS submitted,
        AVG(
          CASE
            WHEN s.max_score IS NULL OR s.max_score = 0 OR s.total_score IS NULL THEN NULL
            ELSE (s.total_score / s.max_score) * 100
          END
        ) AS avgScorePct
      FROM attempts a
      LEFT JOIN attempt_scores s ON s.attempt_id = a.id
      WHERE a.submitted_at IS NOT NULL
        AND a.submitted_at >= (NOW() - INTERVAL 7 DAY)
      GROUP BY DATE(a.submitted_at)
      ORDER BY day ASC;
    `);

    const trend = (trendRows || []).map((r) => ({
      day: r.day, // YYYY-MM-DD
      submitted: Number(r.submitted || 0),
      avgScorePct: r.avgScorePct != null ? Number(r.avgScorePct).toFixed(1) : null,
    }));

    // 5) Weak topics leaderboard (top 10) based on skill_gaps table
    // If you store gap_score and priority_rank, use that.
    // We’ll aggregate by topic_tag: average gap_score and count.
    const [weakRows] = await sequelize.query(`
      SELECT
        topic_tag,
        AVG(gap_score) AS avgGap,
        COUNT(*) AS occurrences
      FROM skill_gaps
      GROUP BY topic_tag
      ORDER BY avgGap DESC, occurrences DESC
      LIMIT 10;
    `);

    const weakTopics = (weakRows || []).map((r) => ({
      topic_tag: r.topic_tag,
      avgGap: r.avgGap != null ? Number(r.avgGap).toFixed(2) : "0.00",
      occurrences: Number(r.occurrences || 0),
    }));

    // 6) Recent activity (last 10 attempts)
    const [recentRows] = await sequelize.query(`
      SELECT
        a.id AS attemptId,
        a.user_id AS userId,
        u.email AS email,
        a.status AS status,
        a.started_at AS startedAt,
        a.submitted_at AS submittedAt,
        CASE
          WHEN s.max_score IS NULL OR s.max_score = 0 OR s.total_score IS NULL THEN NULL
          ELSE ROUND((s.total_score / s.max_score) * 100, 1)
        END AS scorePct
      FROM attempts a
      LEFT JOIN users u ON u.id = a.user_id
      LEFT JOIN attempt_scores s ON s.attempt_id = a.id
      ORDER BY a.id DESC
      LIMIT 10;
    `);

    const recentActivity = (recentRows || []).map((r) => ({
      attemptId: r.attemptId,
      userId: r.userId,
      email: r.email,
      status: r.status,
      startedAt: r.startedAt,
      submittedAt: r.submittedAt,
      scorePct: r.scorePct != null ? Number(r.scorePct) : null,
    }));

    return res.json({
      generatedAt: new Date().toISOString(),
      kpis: {
        usersCount,
        attemptsCount,
        submittedCount,
        completionRatePct,
        avgScorePct,
      },
      trend,
      weakTopics,
      recentActivity,
    });
  } catch (e) {
    return res.status(500).json({ message: "Failed to generate analytics", error: String(e?.message || e) });
  }
}

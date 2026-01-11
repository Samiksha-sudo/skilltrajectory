import { StudyPlan, StudyPlanWeek, UserProfile } from "../db.js";

export async function getTimeEstimate(req, res) {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: "Unauthenticated" });

    const planId = Number(req.params.planId);
    if (!Number.isInteger(planId)) {
      return res.status(400).json({ message: "Invalid planId" });
    }

    const plan = await StudyPlan.findByPk(planId);
    if (!plan || plan.user_id !== userId) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const weeks = await StudyPlanWeek.findAll({
      where: { plan_id: planId },
    });

    if (!weeks.length) {
      return res.status(409).json({ message: "No study plan weeks found" });
    }

    const totalMinutes = weeks.reduce(
      (sum, w) => sum + (w.estimated_minutes || 0),
      0
    );

    const profile = await UserProfile.findByPk(userId);
    const dailyMinutes = profile?.daily_study_minutes ?? 60;

    const days = Math.ceil(totalMinutes / dailyMinutes);
    const weeksEstimate = Math.ceil(days / 7);

    return res.status(200).json({
      planId,
      total_minutes: totalMinutes,
      daily_study_minutes: dailyMinutes,
      estimated_days: days,
      estimated_weeks: weeksEstimate,
      explanation: {
        formula: "total_minutes ÷ daily_study_minutes",
        note:
          "Estimate assumes consistent daily study and completion of all planned tasks.",
      },
    });
  } catch (err) {
    console.error("getTimeEstimate error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

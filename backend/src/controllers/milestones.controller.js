import { StudyPlan, StudyPlanWeek } from "../db.js";

export async function getMilestones(req, res) {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: "Unauthenticated" });

    const planId = Number(req.params.planId);
    if (!Number.isInteger(planId)) return res.status(400).json({ message: "Invalid planId" });

    const plan = await StudyPlan.findByPk(planId);
    if (!plan || plan.user_id !== userId) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const weeks = await StudyPlanWeek.findAll({
      where: { plan_id: planId },
      order: [["week_no", "ASC"]],
    });

    const milestones = weeks.map((w) => {
      const tasks = Array.isArray(w.tasks_json) ? w.tasks_json : [];
      const topics = tasks.map((t) => t.topic_tag).filter(Boolean);
      return {
        week_no: w.week_no,
        objective: w.objective || `Week ${w.week_no} milestone`,
        estimated_minutes: w.estimated_minutes || 0,
        milestone_title:
          topics.length > 0
            ? `Focus: ${topics.slice(0, 3).join(", ")}${topics.length > 3 ? "…" : ""}`
            : `Weekly milestone`,
        topics,
        tasks,
      };
    });

    return res.status(200).json({ planId, milestones });
  } catch (err) {
    console.error("getMilestones error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

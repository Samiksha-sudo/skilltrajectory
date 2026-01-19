import { StudyPlan, StudyPlanWeek, UserProfile } from "../db.js";
import { buildTopicPriority, generateWeeklyPlan } from "../services/plan.service.js";

// You already have gaps endpoint; reuse by calling the same logic or compute again.
// Here we assume frontend sends weakTopics array (simpler) OR you fetch from your gaps endpoint.
export async function generatePlan(req, res) {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: "Unauthenticated" });

    const { attemptId, weakTopics, focusSummary } = req.body || {};
    const aId = Number(attemptId);
    if (!Number.isInteger(aId)) return res.status(400).json({ message: "Invalid attemptId" });

    // daily minutes from profile (fallback 60)
    const profile = await UserProfile.findByPk(userId);
    const dailyMinutes = profile?.daily_study_minutes ?? 60;

    // Build priority
    const rankedTopics = buildTopicPriority({ weakTopics: weakTopics || [] });

    if (!rankedTopics.length) {
      return res.status(409).json({
        message: "No weak topics available to generate a plan. Complete a scored attempt first.",
      });
    }

    const planGen = generateWeeklyPlan({ rankedTopics, dailyMinutes });

    // Create plan header
    const plan = await StudyPlan.create({
      user_id: userId,
      attempt_id: aId,
      created_at: new Date(),
      plan_version: 1,
      focus_summary: focusSummary || `Focus on top ${Math.min(5, rankedTopics.length)} weak topics`,
    });

    // Create weeks
    for (const w of planGen.weekRows) {
      await StudyPlanWeek.create({
        plan_id: plan.id,
        week_no: w.week_no,
        objective: w.objective,
        tasks_json: w.tasks_json,
        estimated_minutes: w.estimated_minutes,
      });
    }

    return res.status(201).json({
      message: "Plan generated",
      planId: plan.id,
      topicsOrdered: rankedTopics.map((t) => ({
        topic_tag: t.topic_tag,
        priority_score: t.priority_score,
        accuracy_pct: t.accuracy_pct,
      })),
      meta: {
        dailyMinutes: planGen.safeDaily,
        weeklyCapacity: planGen.weeklyCapacity,
        totalMinutes: planGen.totalMinutes,
      },
    });
  } catch (err) {
    console.error("generatePlan error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getPlan(req, res) {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: "Unauthenticated" });

    const planId = Number(req.params.planId);
    if (!Number.isInteger(planId)) return res.status(400).json({ message: "Invalid planId" });

    const plan = await StudyPlan.findByPk(planId);
    if (!plan || plan.user_id !== userId) return res.status(404).json({ message: "Plan not found" });

    const weeks = await StudyPlanWeek.findAll({
      where: { plan_id: planId },
      order: [["week_no", "ASC"]],
    });

    return res.status(200).json({ plan, weeks });
  } catch (err) {
    console.error("getPlan error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

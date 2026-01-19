import { StudyProgress } from "../db.js";

export async function updateProgress(req, res) {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: "Unauthenticated" });

    const { planId, weekNo, topicTag, status } = req.body;

    if (!planId || !weekNo || !topicTag || !status) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const [row] = await StudyProgress.upsert({
      user_id: userId,
      plan_id: planId,
      week_no: weekNo,
      topic_tag: topicTag,
      status,
      completed_at: status === "DONE" ? new Date() : null,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("updateProgress error:", err);
    res.status(500).json({ message: "Server error" });
  }
}


export async function getProgress(req, res) {
  try {
    const userId = req.user?.sub;
    const planId = Number(req.params.planId);

    const rows = await StudyProgress.findAll({
      where: { user_id: userId, plan_id: planId },
    });

    res.json({ progress: rows });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}


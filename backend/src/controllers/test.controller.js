import { Test } from "../db.js";

export async function getActiveTest(req, res) {
  try {
    const test = await Test.findOne({ where: { is_active: true } });
    if (!test) return res.status(404).json({ message: "No active test found" });

    return res.status(200).json({
      test: {
        id: test.id,
        name: test.name,
        duration_minutes: test.duration_minutes,
        section_config_json: test.section_config_json,
      },
    });
  } catch (err) {
    console.error("getActiveTest error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

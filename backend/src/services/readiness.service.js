export function calculateReadiness({ totalScore, maxScore, accuracyPct, avgTimePerQ }) {
  // Basic sanity
  if (maxScore == null || maxScore <= 0 || totalScore == null) {
    return {
      readiness_level: "Unknown",
      confidence_score: 0.2,
      explanation: {
        reason: "Score data not available",
        score_pct: null,
        rule: "N/A",
      },
    };
  }

  const scorePct = (totalScore / maxScore) * 100;

  // Threshold mapping (simple + explainable)
  // You can adjust thresholds to match your dissertation narrative
  let level = "Beginner";
  if (scorePct >= 80) level = "Interview-Ready";
  else if (scorePct >= 60) level = "Intermediate";

  // Confidence score (0–1), explainable and stable:
  // base confidence from accuracy + small adjustment for consistency factors (optional)
  const acc = accuracyPct != null ? Number(accuracyPct) : scorePct;
  let confidence = 0.4 + (acc / 100) * 0.6; // 0.4..1.0
  confidence = Math.max(0, Math.min(1, confidence));

  // Optional: adjust by speed if you store avgTimePerQ (not required)
  if (avgTimePerQ != null) {
    const t = Number(avgTimePerQ);
    // Slight penalty if extremely slow, slight boost if moderate (purely illustrative)
    if (t > 90) confidence = Math.max(0, confidence - 0.05);
    if (t > 0 && t < 45) confidence = Math.min(1, confidence + 0.03);
  }

  const explanation = {
    score_pct: Number(scorePct.toFixed(2)),
    thresholds: { beginner: "<60", intermediate: "60–79", interview_ready: ">=80" },
    rule_applied:
      level === "Interview-Ready"
        ? "score_pct >= 80"
        : level === "Intermediate"
        ? "score_pct >= 60"
        : "score_pct < 60",
    notes:
      "Readiness is derived from scored performance and mapped to levels using fixed thresholds for transparency.",
  };

  return {
    readiness_level: level,
    confidence_score: Number(confidence.toFixed(2)),
    explanation,
  };
}

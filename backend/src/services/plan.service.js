function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Convert gaps into an ordered list of topics with priority.
 * Priority is primarily gap_score, then total incorrect.
 */
export function buildTopicPriority({ weakTopics = [] }) {
  const ranked = [...weakTopics]
    .map((t) => ({
      topic_tag: t.topic_tag,
      accuracy_pct: t.accuracy_pct,
      gap_score: t.gap_score,
      total: t.total,
      correct: t.correct,
      incorrect: (t.total ?? 0) - (t.correct ?? 0),
      priority_score: (t.gap_score ?? 0) * 100 + ((t.total ?? 0) - (t.correct ?? 0)), // explainable
    }))
    .sort((a, b) => b.priority_score - a.priority_score);

  return ranked;
}

/**
 * Build a simple 4-week plan (you can scale later).
 * Allocate more minutes to higher-priority topics.
 */
export function generateWeeklyPlan({ rankedTopics, dailyMinutes = 60 }) {
  const safeDaily = clamp(Number(dailyMinutes) || 60, 15, 300);
  const weeklyCapacity = safeDaily * 7;

  const topicCount = rankedTopics.length || 1;
  const weeks = 4;

  // Use weights: top topics get more time
  const weights = rankedTopics.map((_, idx) => {
    // 1.0 for top, down to 0.4 minimum
    return clamp(1 - idx * 0.12, 0.4, 1);
  });
  const weightSum = weights.reduce((a, b) => a + b, 0);

  // Total plan minutes: weeks * weeklyCapacity
  const totalMinutes = weeks * weeklyCapacity;

  const topicMinutes = rankedTopics.map((t, i) => ({
    ...t,
    allocated_minutes: Math.round((weights[i] / weightSum) * totalMinutes),
  }));

  // Pack topics into week buckets
  const weekRows = [];
  let pointer = 0;

  for (let w = 1; w <= weeks; w++) {
    let remaining = weeklyCapacity;
    const tasks = [];

    while (remaining > 0 && pointer < topicMinutes.length) {
      const topic = topicMinutes[pointer];

      const chunk = Math.min(remaining, topic.allocated_minutes);
      if (chunk > 0) {
        tasks.push({
          topic_tag: topic.topic_tag,
          minutes: chunk,
          tasks: [
            `Review fundamentals for ${topic.topic_tag}`,
            `Practice 10 questions on ${topic.topic_tag}`,
            `Revise mistakes and note patterns`,
          ],
        });

        topic.allocated_minutes -= chunk;
        remaining -= chunk;
      }

      if (topic.allocated_minutes <= 0) pointer += 1;
    }

    weekRows.push({
      week_no: w,
      objective: w === 1 ? "Fix top weak areas" : w === weeks ? "Mock test + revision" : "Build consistency",
      tasks_json: tasks,
      estimated_minutes: weeklyCapacity - remaining,
    });
  }

  return { safeDaily, weeklyCapacity, totalMinutes, weekRows };
}

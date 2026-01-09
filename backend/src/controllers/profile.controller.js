import { UserProfile } from "../db.js";

const validExp = new Set(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);

export async function getProfile(req, res) {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: "Unauthenticated" });

    const profile = await UserProfile.findByPk(userId);
    return res.status(200).json({ profile: profile || null });
  } catch (err) {
    console.error("getProfile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}


export async function upsertProfile(req, res) {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: "Unauthenticated" });

    const { target_role, experience_level, daily_study_minutes } = req.body;

    if (target_role !== undefined) {
      if (!target_role || typeof target_role !== "string" || target_role.trim().length < 2) {
        return res.status(400).json({ message: "Target role is required" });
      }
    }

    if (experience_level !== undefined) {
      if (!experience_level || !validExp.has(experience_level)) {
        return res.status(400).json({ message: "Experience level is invalid" });
      }
    }

    // Sprint 4 requirement: daily study time in minutes + validation
    let minutes = null;
    if (daily_study_minutes !== undefined) {
      // allow null to clear it
      if (daily_study_minutes === null || daily_study_minutes === "") {
        minutes = null;
      } else {
        const m = Number(daily_study_minutes);
        if (!Number.isInteger(m)) {
          return res.status(400).json({ message: "Daily study time must be a whole number (minutes)" });
        }
        if (m < 15 || m > 300) {
          return res.status(400).json({ message: "Daily study time must be between 15 and 300 minutes" });
        }
        minutes = m;
      }
    }

    const existing = await UserProfile.findByPk(userId);

    // Build update payload only for provided fields (senior approach)
    const payload = { updated_at: new Date() };
    if (target_role !== undefined) payload.target_role = target_role.trim();
    if (experience_level !== undefined) payload.experience_level = experience_level;
    if (daily_study_minutes !== undefined) payload.daily_study_minutes = minutes;

    if (!existing) {
      // For first creation, require target_role + experience_level (profile must be valid)
      if (!target_role || !experience_level) {
        return res.status(400).json({ message: "Create profile requires target_role and experience_level" });
      }

      await UserProfile.create({
        user_id: userId,
        target_role: target_role.trim(),
        experience_level,
        daily_study_minutes: minutes,
        updated_at: new Date(),
      });
    } else {
      await UserProfile.update(payload, { where: { user_id: userId } });
    }

    return res.status(200).json({ message: "Profile saved successfully" });
  } catch (err) {
    console.error("upsertProfile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}


import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { getProfile, upsertProfile } from "../controllers/profile.controller.js";

const router = Router();

router.get("/profile", requireAuth, getProfile);
router.put("/profile", requireAuth, upsertProfile);

export default router;

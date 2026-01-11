import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { getSkillGaps } from "../controllers/gaps.controller.js";

const router = Router();
router.get("/attempts/:id/gaps", requireAuth, getSkillGaps);

export default router;

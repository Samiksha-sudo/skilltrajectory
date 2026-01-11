import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { getMilestones } from "../controllers/milestones.controller.js";

const router = Router();
router.get("/plans/:planId/milestones", requireAuth, getMilestones);

export default router;

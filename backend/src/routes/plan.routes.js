import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { generatePlan, getPlan } from "../controllers/plan.controller.js";

const router = Router();

router.post("/plans/generate", requireAuth, generatePlan);
router.get("/plans/:planId", requireAuth, getPlan);

export default router;

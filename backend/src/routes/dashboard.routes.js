import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { getDashboardSummary } from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/dashboard/summary", requireAuth, getDashboardSummary);

export default router;

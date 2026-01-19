import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import { adminAnalyticsSummary } from "../controllers/admin.analytics.controller.js";

const router = Router();

router.get("/admin/analytics/summary", requireAuth, requireAdmin, adminAnalyticsSummary);

export default router;

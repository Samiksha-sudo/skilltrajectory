import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { getReadiness } from "../controllers/readiness.controller.js";

const router = Router();
router.get("/attempts/:id/readiness", requireAuth, getReadiness);

export default router;

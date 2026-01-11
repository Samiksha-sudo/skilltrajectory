import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { getTimeEstimate } from "../controllers/timeEstimate.controller.js";

const router = Router();

router.get("/plans/:planId/time-estimate", requireAuth, getTimeEstimate);

export default router;

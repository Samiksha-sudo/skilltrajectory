import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { updateProgress, getProgress } from "../controllers/progress.controller.js";

const router = Router();

router.post("/progress/update", requireAuth, updateProgress);
router.get("/progress/:planId", requireAuth, getProgress);

export default router;

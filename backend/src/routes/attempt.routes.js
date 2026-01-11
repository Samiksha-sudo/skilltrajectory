import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { startAttempt, getAttemptQuestions } from "../controllers/attempt.controller.js";
import { submitAttempt } from "../controllers/attempt.controller.js";
import { saveAnswer } from "../controllers/attempt.controller.js";

const router = Router();

router.post("/attempts/start", requireAuth, startAttempt);
router.get("/attempts/:id/questions", requireAuth, getAttemptQuestions);
router.post("/attempts/:id/submit", requireAuth, submitAttempt);
router.post("/attempts/:id/answer", requireAuth, saveAnswer);
router.get("/attempts/:id/questions", requireAuth, getAttemptQuestions);

export default router;

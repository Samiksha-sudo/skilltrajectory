import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

import {
  listQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../controllers/admin.questions.controller.js";

const router = Router();

router.get("/admin/questions", requireAuth, requireAdmin, listQuestions);
router.get("/admin/questions/:id", requireAuth, requireAdmin, getQuestion);
router.post("/admin/questions", requireAuth, requireAdmin, createQuestion);
router.put("/admin/questions/:id", requireAuth, requireAdmin, updateQuestion);
router.delete("/admin/questions/:id", requireAuth, requireAdmin, deleteQuestion);

export default router;

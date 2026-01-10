import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { getActiveTest } from "../controllers/test.controller.js";

const router = Router();

router.get("/tests/active", requireAuth, getActiveTest);

export default router;

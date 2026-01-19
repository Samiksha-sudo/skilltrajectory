import { Router } from "express";
import { adminLogin } from "../controllers/admin.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import { adminSummary } from "../controllers/admin.analytics.controller.js";

const router = Router();

// Admin login
router.post("/admin/login", adminLogin);

// Example protected admin dashboard ping
router.get("/admin/me", requireAuth, requireAdmin, (req, res) => {
  res.json({ ok: true, role: req.user.role, adminId: req.user.sub });
});

router.get("/admin/summary",requireAuth, requireAdmin, adminSummary);

export default router;

import { Router } from "express";
import { adminLogin } from "../controllers/admin.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// Admin login
router.post("/admin/login", adminLogin);

// Example protected admin dashboard ping
router.get("/admin/me", requireAuth, requireAdmin, (req, res) => {
  res.json({ ok: true, role: req.user.role, adminId: req.user.sub });
});

export default router;

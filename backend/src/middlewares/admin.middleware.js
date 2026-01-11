export function requireAdmin(req, res, next) {
  // assumes requireAuth already put decoded token into req.user
  if (!req.user) return res.status(401).json({ message: "Unauthenticated" });

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden: Admin only" });
  }

  next();
}

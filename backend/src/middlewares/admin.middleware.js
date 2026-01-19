export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }

  // Safe logging (optional)
  console.log("Admin access:", {
    userId: req.user.id,
    role: req.user.role,
    path: req.originalUrl,
  });

  next();
}

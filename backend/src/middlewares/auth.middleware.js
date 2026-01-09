import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.st_token;
    if (!token) return res.status(401).json({ message: "Unauthenticated" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { sub: userId, role: ... }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
}

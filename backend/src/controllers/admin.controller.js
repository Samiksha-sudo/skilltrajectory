import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../db.js";

export async function adminLogin(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // must be ADMIN
    if (user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // cookie security options
    res.cookie("st_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // set true in production (https)
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.json({
      message: "Admin login success",
      user: { id: user.id, email: user.email, role: user.role, name: user.name },
    });
  } catch (err) {
    console.error("adminLogin error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

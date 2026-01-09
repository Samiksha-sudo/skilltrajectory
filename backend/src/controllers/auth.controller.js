import bcrypt from "bcrypt";
import { User } from "../db.js";
import jwt from "jsonwebtoken";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name || null,
      email,
      password_hash,
      role: "USER",
      created_at: new Date(),
    });

    return res.status(201).json({
      message: "Registration successful",
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    // handles unique constraint race condition too
    if (err?.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "Email already registered" });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await User.findOne({ where: { email } });

    // AC: Invalid login shows error message (do not reveal whether email exists)
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // AC: Session starts after login (httpOnly cookie)
    res.cookie("st_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // set true in production with HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    return res.status(200).json({
      message: "Login successful",
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}


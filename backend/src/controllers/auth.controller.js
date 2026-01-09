import bcrypt from "bcrypt";
import { User } from "../db.js";

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

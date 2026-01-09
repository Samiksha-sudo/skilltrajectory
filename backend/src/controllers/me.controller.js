import { User } from "../db.js"; 

export async function me(req, res) {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ message: "Unauthenticated" });

  const user = await User.findByPk(userId, {
    attributes: ["id", "name", "email", "role", "created_at"],
  });

  if (!user) return res.status(404).json({ message: "User not found" });

  return res.status(200).json({ user });
}

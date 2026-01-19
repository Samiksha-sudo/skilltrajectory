export async function adminLogout(req, res) {
  res.clearCookie("admin_token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "dev",
  });

  return res.json({ success: true });
}



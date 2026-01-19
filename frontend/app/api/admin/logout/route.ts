const BACKEND = process.env.BACKEND_URL || "http://localhost:4000";

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie") || "";

  const res = await fetch(`${BACKEND}/api/auth/logout`, {
    method: "POST",
    headers: { cookie },
  });

  return new Response(await res.text(), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

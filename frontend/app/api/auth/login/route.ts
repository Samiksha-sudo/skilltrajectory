import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const BACKEND_BASE = process.env.BACKEND_BASE_URL || "http://localhost:4000";

  const res = await fetch(`${BACKEND_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();

  // Forward Set-Cookie from backend -> browser (critical for session)
  const nextRes = new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });

  const setCookie = res.headers.get("set-cookie");
  if (setCookie) nextRes.headers.set("set-cookie", setCookie);

  return nextRes;
}

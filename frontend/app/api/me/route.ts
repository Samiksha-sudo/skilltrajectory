import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const BACKEND_BASE = process.env.BACKEND_BASE_URL || "http://localhost:4000";

  const cookie = req.headers.get("cookie") || "";

  const res = await fetch(`${BACKEND_BASE}/api/me`, {
    method: "GET",
    headers: {
      cookie, // forward session cookie to backend
    },
  });

  const text = await res.text();

  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

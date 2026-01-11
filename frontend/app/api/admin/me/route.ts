import { NextResponse } from "next/server";
const BACKEND = process.env.BACKEND_BASE_URL || "http://localhost:4000";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";

  const res = await fetch(`${BACKEND}/api/admin/me`, {
    headers: { cookie, Accept: "application/json" },
    cache: "no-store",
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

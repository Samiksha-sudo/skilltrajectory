import { NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_BASE_URL || "http://localhost:4000";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const res = await fetch(`${BACKEND}/api/profile`, { headers: { cookie } });
  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: { "Content-Type": "application/json" } });
}

export async function PUT(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const body = await req.json();
  const res = await fetch(`${BACKEND}/api/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: { "Content-Type": "application/json" } });
}

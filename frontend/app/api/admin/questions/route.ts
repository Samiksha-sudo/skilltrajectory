import { NextResponse } from "next/server";
const BACKEND = process.env.BACKEND_BASE_URL || "http://localhost:4000";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const url = new URL(req.url);

  const res = await fetch(`${BACKEND}/api/admin/questions?${url.searchParams}`, {
    headers: { cookie, Accept: "application/json" },
    cache: "no-store",
  });

  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: { "Content-Type": "application/json" } });
}

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const body = await req.text();

  const res = await fetch(`${BACKEND}/api/admin/questions`, {
    method: "POST",
    headers: { cookie, "Content-Type": "application/json", Accept: "application/json" },
    body,
  });

  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: { "Content-Type": "application/json" } });
}

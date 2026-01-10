import { NextResponse } from "next/server";
const BACKEND = process.env.BACKEND_BASE_URL || "http://localhost:4000";

export async function POST(req: Request, ctx: { params: any }) {
  const cookie = req.headers.get("cookie") || "";
  const rawParams = typeof ctx.params?.then === "function" ? await ctx.params : ctx.params;
  const id = rawParams?.id;

  const body = await req.text();

  const res = await fetch(`${BACKEND}/api/attempts/${id}/answer`, {
    method: "POST",
    headers: { cookie, "Content-Type": "application/json", Accept: "application/json" },
    body: body || "{}",
  });

  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: { "Content-Type": "application/json" } });
}

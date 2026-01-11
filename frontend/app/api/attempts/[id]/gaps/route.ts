import { NextResponse } from "next/server";
const BACKEND = process.env.BACKEND_BASE_URL || "http://localhost:4000";

export async function GET(req: Request, ctx: { params: any }) {
  const cookie = req.headers.get("cookie") || "";
  const rawParams = typeof ctx.params?.then === "function" ? await ctx.params : ctx.params;
  const id = rawParams?.id;

  const res = await fetch(`${BACKEND}/api/attempts/${id}/gaps`, {
    headers: { cookie, Accept: "application/json" },
    cache: "no-store",
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

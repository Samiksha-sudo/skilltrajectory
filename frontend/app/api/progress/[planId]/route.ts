import { NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_BASE_URL || "http://localhost:4000";

export async function GET(req: Request, ctx: { params: any }) {
  const cookie = req.headers.get("cookie") || "";

  // Next.js 16: params can be a Promise, unwrap safely
  const rawParams =
    typeof ctx.params?.then === "function" ? await ctx.params : ctx.params;

  const planId = rawParams?.planId;

  if (!planId) {
    return NextResponse.json({ message: "Missing planId" }, { status: 400 });
  }

  const res = await fetch(`${BACKEND}/api/progress/${planId}`, {
    headers: { cookie, Accept: "application/json" },
    cache: "no-store",
  });

  const text = await res.text();

  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

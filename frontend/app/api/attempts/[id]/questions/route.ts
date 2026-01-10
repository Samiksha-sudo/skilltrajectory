import { NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_BASE_URL || "http://localhost:4000";

export async function GET(
  req: Request,
  ctx: { params: any } // keep flexible for Next versions where params may be async
) {
  const cookie = req.headers.get("cookie") || "";

  // Next.js versions differ: params can be an object or a Promise
  const rawParams = typeof ctx.params?.then === "function" ? await ctx.params : ctx.params;
  const id = rawParams?.id;

  if (!id) {
    return NextResponse.json(
      { message: "Missing attempt id in route params" },
      { status: 400 }
    );
  }

  const res = await fetch(`${BACKEND}/api/attempts/${id}/questions`, {
    method: "GET",
    headers: {
      cookie,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const text = await res.text();

  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

import { NextResponse } from "next/server";
const BACKEND = process.env.BACKEND_BASE_URL || "http://localhost:4000";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: { params: { id: string } }) {
  const cookie = req.headers.get("cookie") || "";
  const id = ctx.params.id;

  const res = await fetch(`${BACKEND}/api/admin/questions/${id}`, {
    headers: { cookie, Accept: "application/json" },
    cache: "no-store",
  });

  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: { "Content-Type": "application/json" } });
}

export async function PUT(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const cookie = req.headers.get("cookie") || "";
  const body = await req.text();

  const res = await fetch(`${BACKEND}/api/admin/questions/${id}`, {
    method: "PUT",
    headers: {
      cookie,
      "Content-Type": "application/json",
    },
    body,
    cache: "no-store",
  });

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(req: Request, ctx: { params: { id: string } }) {
  const cookie = req.headers.get("cookie") || "";
  const id = ctx.params.id;

  const res = await fetch(`${BACKEND}/api/admin/questions/${id}`, {
    method: "DELETE",
    headers: { cookie, Accept: "application/json" },
  });

  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: { "Content-Type": "application/json" } });
}

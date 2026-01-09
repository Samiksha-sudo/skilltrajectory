import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const BACKEND_BASE =
      process.env.BACKEND_BASE_URL || "http://localhost:4000";

    const res = await fetch(`${BACKEND_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    // Return backend response as-is, preserving status code
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return NextResponse.json(
      { message: "Next API error", error: String(e?.message || e) },
      { status: 500 }
    );
  }
}

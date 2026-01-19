import { NextResponse } from "next/server";

const BACKEND = "http://localhost:4000";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const url = new URL(req.url);

  const oldId = url.searchParams.get("oldId");
  const newId = url.searchParams.get("newId");

  if (!oldId || !newId)
    return NextResponse.json({ message: "Missing IDs" }, { status: 400 });

  const res = await fetch(
    `${BACKEND}/api/attempts/compare?oldId=${oldId}&newId=${newId}`,
    {
      headers: { cookie },
      cache: "no-store",
    }
  );

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

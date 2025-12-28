import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // Put whatever images you want in /public/hero/
  const images = [
    "/hero/Great Room 3.jpg",
    "/hero/Great Room 2.jpg",
    "/hero/Kitchen 1.jpg",
    "/hero/Bedroom 1.jpg",
  ];

  return NextResponse.json({ images });
}

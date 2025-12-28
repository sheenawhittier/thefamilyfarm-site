import { NextResponse } from "next/server";

export async function GET() {
  const images = [
    "/hero/Great Room 3.jpg",
    "/hero/Great Room 2.jpg",
    "/hero/Kitchen 1.jpg",
    "/hero/Bedroom 1.jpg",
  ];

  return NextResponse.json({ images });
}

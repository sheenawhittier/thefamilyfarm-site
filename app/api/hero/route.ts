// app/api/hero/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const dir = path.join(process.cwd(), "public", "images", "hero");
    const files = fs
      .readdirSync(dir)
      .filter(f => /\.(jpe?g|png|webp)$/i.test(f))   // skip HEIC
      .sort((a, b) => a.localeCompare(b));

    const images = files.map(name => {
      const alt = name
        .replace(/\.[^.]+$/, "")
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());
      return { src: `/images/hero/${name}`, alt };
    });

    return NextResponse.json({ images }, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (e) {
    return NextResponse.json({ images: [], error: String(e) }, { status: 500 });
  }
}


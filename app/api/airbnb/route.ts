// app/api/airbnb/route.ts
import { NextResponse } from "next/server";
import * as ical from "node-ical";

export const runtime = "nodejs";
export const revalidate = 60 * 15; // 15 minutes

type Range = { start: string; end: string };

export async function GET() {
  const url = process.env.AIRBNB_ICAL_URL;

  if (!url) {
    return NextResponse.json(
      { error: "Missing AIRBNB_ICAL_URL (check .env.local)" },
      { status: 500 }
    );
  }

  try {
    const data = await ical.async.fromURL(url);

    const ranges: Range[] = [];

    for (const key of Object.keys(data)) {
      const ev: any = (data as any)[key];
      if (!ev || ev.type !== "VEVENT") continue;
      if (ev.status && String(ev.status).toUpperCase() === "CANCELLED") continue;

      const start = toYMD(ev.start);

      // Airbnb iCal DTEND is exclusive — make it inclusive for your UI
      const endDate = new Date(ev.end);
      endDate.setDate(endDate.getDate() - 1);
      const end = toYMD(endDate);

      ranges.push({ start, end });
    }

    // Merge overlapping/touching ranges
    ranges.sort((a, b) => a.start.localeCompare(b.start));

    const merged: Range[] = [];
    for (const r of ranges) {
      if (merged.length === 0) {
        merged.push({ ...r });
        continue;
      }

      const last = merged[merged.length - 1];
      const rStart = parseYMD(r.start);
      const lastEndPlusOne = addDays(parseYMD(last.end), 1);

      if (rStart <= lastEndPlusOne) {
        // overlap/touch
        if (parseYMD(r.end) > parseYMD(last.end)) last.end = r.end;
      } else {
        merged.push({ ...r });
      }
    }

    return NextResponse.json({
      ranges: merged,
      lastUpdated: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Failed to fetch iCal" },
      { status: 500 }
    );
  }
}

function toYMD(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function parseYMD(s: string) {
  const [Y, M, D] = s.split("-").map((n) => parseInt(n, 10));
  return new Date(Y, M - 1, D);
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

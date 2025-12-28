import { NextResponse } from "next/server";
import ical from "node-ical";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Range = { start: string; end: string };

function toISODate(d: Date) {
  // YYYY-MM-DD
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function GET() {
  try {
    const icalUrl = process.env.AIRBNB_ICAL_URL;

    if (!icalUrl) {
      // Don’t hard-fail the whole site if env var is missing
      return NextResponse.json(
        { ranges: [], lastUpdated: new Date().toISOString(), error: "Missing AIRBNB_ICAL_URL" },
        { status: 200 }
      );
    }

    const data = await ical.async.fromURL(icalUrl);

    const ranges: Range[] = [];

    for (const key of Object.keys(data)) {
      const ev = data[key] as any;

      // Airbnb blocks are typically VEVENTs with start/end
      if (ev?.type === "VEVENT" && ev.start && ev.end) {
        const start = new Date(ev.start);
        const end = new Date(ev.end);

        // Many iCal feeds treat end as exclusive; subtract a day for display blocking
        const endInclusive = new Date(end);
        endInclusive.setDate(endInclusive.getDate() - 1);

        ranges.push({
          start: toISODate(start),
          end: toISODate(endInclusive),
        });
      }
    }

    return NextResponse.json({
      ranges,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error("Airbnb iCal sync error:", err);
    return NextResponse.json(
      { ranges: [], lastUpdated: new Date().toISOString(), error: "Sync failed" },
      { status: 200 }
    );
  }
}



import { NextResponse } from "next/server";

type Range = { start: string; end: string };

// Unfold folded iCal lines
function unfoldIcs(text: string) {
  return text.replace(/\r?\n[ \t]/g, "");
}

function yyyymmddToIso(s: string) {
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

function isoToDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(iso: string, days: number) {
  const d = isoToDate(iso);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseIcsToRanges(ics: string): Range[] {
  const unfolded = unfoldIcs(ics);
  const events = unfolded.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) ?? [];
  const ranges: Range[] = [];

  for (const ev of events) {
    const startMatch =
      ev.match(/DTSTART(?:;[^:]*)?:(\d{8})/) ??
      ev.match(/DTSTART(?:;[^:]*)?:(\d{8})T/);

    const endMatch =
      ev.match(/DTEND(?:;[^:]*)?:(\d{8})/) ??
      ev.match(/DTEND(?:;[^:]*)?:(\d{8})T/);

    if (!startMatch || !endMatch) continue;

    const startIso = yyyymmddToIso(startMatch[1]);
    const endExclusive = yyyymmddToIso(endMatch[1]);
    const endInclusive = addDays(endExclusive, -1);

    ranges.push({ start: startIso, end: endInclusive });
  }

  return ranges.sort((a, b) => a.start.localeCompare(b.start));
}

export async function GET() {
  const calendarUrl = process.env.AIRBNB_ICAL_URL;

  if (!calendarUrl) {
    return NextResponse.json({
      calendarUrl: null,
      ranges: [],
      lastUpdated: null,
      error: "Missing AIRBNB_ICAL_URL",
    });
  }

  try {
    const res = await fetch(calendarUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const icsText = await res.text();
    const ranges = parseIcsToRanges(icsText);

    return NextResponse.json({
      calendarUrl,
      ranges,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({
      calendarUrl,
      ranges: [],
      lastUpdated: new Date().toISOString(),
      error: err?.message ?? "Failed to fetch calendar",
    });
  }
}



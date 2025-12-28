import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    calendarUrl: process.env.AIRBNB_ICAL_URL ?? null,
  });
}



import { NextResponse } from "next/server";

export const revalidate = 60 * 60; // refresh once per hour

export async function GET() {
  // Add/edit these to match what you have in /public/hero
  // NOTE: file names with spaces are risky on the web. Prefer hyphens.
  const items = [
    { src: "/hero/great-room-3.jpg", alt: "Great room", href: "#book" },
    { src: "/hero/kitchen.jpg", alt: "Kitchen", href: "#book" },
    { src: "/hero/bedroom.jpg", alt: "Bedroom", href: "#book" },
    { src: "/hero/farm.jpg", alt: "Farm views", href: "/experiences" },
    { src: "/hero/firepit.jpg", alt: "Firepit", href: "/experiences" },
  ];

  return NextResponse.json({ items });
}

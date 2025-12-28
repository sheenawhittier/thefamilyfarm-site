"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";
import HeroCarousel from "./components/HeroCarousel";

type Range = { start: string; end: string };

export default function FarmstaySite() {
  const airbnbListingId = "35318624";

  // ------- Utils -------
  const pad = (n: number) => String(n).padStart(2, "0");
  const parse = (s: string) => {
    const [Y, M, D] = s.split("-").map((x) => parseInt(x, 10));
    return new Date(Y, M - 1, D);
  };
  const betweenInclusive = (d: Date, a: Date, b: Date) =>
    d.getTime() >= a.getTime() && d.getTime() <= b.getTime();

  // ------- Sync Airbnb iCal via /api/airbnb -------
  const [airbnbRanges, setAirbnbRanges] = useState<Range[]>([]);
  const [airbnbLoading, setAirbnbLoading] = useState(true);
  const [airbnbError, setAirbnbError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setAirbnbLoading(true);
        const res = await fetch("/api/airbnb", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setAirbnbRanges(data.ranges ?? []);
        setLastUpdated(data.lastUpdated ?? null);
        setAirbnbError(null);
      } catch (e: any) {
        console.error("Failed to sync Airbnb calendar", e);
        setAirbnbRanges([]);
        setAirbnbError(e?.message ?? "Sync failed");
      } finally {
        setAirbnbLoading(false);
      }
    }
    load();
  }, []);

  const isBooked = (dateStr: string) => {
    if (!airbnbRanges.length) return false;
    const d = parse(dateStr);
    return airbnbRanges.some((r) =>
      betweenInclusive(d, parse(r.start), parse(r.end))
    );
  };

  // ------- Airbnb URL helper -------
  const buildAirbnbUrlWith = (s?: string, e?: string, g?: number): string => {
    const base = `https://www.airbnb.com/rooms/${airbnbListingId}`;
    if (!s || !e) return base;
    const qs = new URLSearchParams({
      check_in: s,
      check_out: e,
      adults: String(g ?? 1),
      children: "0",
      infants: "0",
      pets: "0",
    }).toString();
    return `${base}?${qs}`;
  };

  // ------- Calendar state -------
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-11
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [guests, setGuests] = useState(2);

  const nights =
    startDate && endDate
      ? Math.max(
          0,
          Math.ceil(
            (parse(endDate).getTime() - parse(startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;

  const nightlyRate = 165;
  const lodging = nights * nightlyRate;

  const goMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstDow = (y: number, m: number) => new Date(y, m, 1).getDay(); // 0=Sun

  const selectDay = (y: number, m: number, day: number) => {
    const dStr = `${y}-${pad(m + 1)}-${pad(day)}`;
    if (isBooked(dStr)) return;

    if (!startDate || (startDate && endDate)) {
      setStartDate(dStr);
      setEndDate("");
      return;
    }
    if (parse(dStr).getTime() < parse(startDate).getTime()) {
      setEndDate(startDate);
      setStartDate(dStr);
    } else {
      setEndDate(dStr);
    }
  };

  const buildAirbnbUrl = () => buildAirbnbUrlWith(startDate, endDate, guests);

  // ------- Page -------
  return (
    <div className="grain min-h-screen bg-gradient-to-b from-[#F7F4EF] to-white text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b border-[#E8E1D8]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image
                src="/W-FamilyFarms-Enoch.jpg"
                alt="The Family Farm logo"
                fill
                sizes="40px"
                style={{ objectFit: "cover", borderRadius: "0.75rem" }}
                priority
              />
            </div>
            <span className="font-serif font-semibold text-lg text-[#1F3A2E]">
              The Family Farm
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#book" className="hover:text-[#B86A47]">
              Availability
            </a>
            <a href="/experiences" className="hover:text-[#B86A47]">
              Experiences
            </a>
            <a href="#contact" className="hover:text-[#B86A47]">
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* Slim hero belt */}
      <HeroCarousel />

      {/* Intro */}
      <section className="max-w-6xl mx-auto px-4 pt-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-[#1F3A2E] leading-tight">
              A cozy farmstay in{" "}
              <span className="text-[#B86A47]">Enoch, Utah</span>
            </h1>
            <p className="mt-4 text-slate-700 text-lg">
              Unplug on our family hobby farm—wake to sheep bleating and chickens
              clucking, stroll the orchard, and sleep under endless skies.
            </p>
            <ul className="mt-4 text-slate-800 list-disc pl-5 space-y-1 text-sm md:text-base">
              <li>2-bedroom guesthouse · Wi-Fi · Full kitchen</li>
              <li>Private patio + firepit · Free parking</li>
              <li>Minutes to Cedar City · Near Zion &amp; Bryce Canyon</li>
            </ul>
          </div>
          <div>
            <img
              src="/hero/great-room-3.jpg"
              alt="Cozy great room at The Family Farm"
              className="aspect-[4/3] w-full rounded-2xl border border-[#E8E1D8] object-cover shadow-[0_24px_60px_rgba(0,0,0,.08)]"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Availability */}
      <section id="book" className="max-w-6xl mx-auto px-4 mt-10 md:mt-16">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="p-6 rounded-2xl bg-white shadow-[0_12px_28px_rgba(0,0,0,.06)] border border-[#E8E1D8]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#1F3A2E]">
                    Availability
                  </h2>

                  <span className="text-xs text-slate-500">
                    {airbnbLoading && "Syncing with Airbnb…"}
                    {!airbnbLoading && airbnbError &&
                      `Sync error (${airbnbError}) — showing blanks`}
                    {!airbnbLoading && !airbnbError && lastUpdated && (
                      <>Synced ✅ · updated {new Date(lastUpdated).toLocaleString()}</>
                    )}
                    {!airbnbLoading && !airbnbError && !lastUpdated && "Synced ✅"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goMonth(-1)}
                    className="px-2 py-1 rounded-lg border border-[#E8E1D8] text-sm hover:bg-[#F7F4EF]"
                  >
                    Prev
                  </button>
                  <div className="w-40 text-center text-sm font-medium">
                    {new Date(viewYear, viewMonth, 1).toLocaleString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <button
                    onClick={() => goMonth(1)}
                    className="px-2 py-1 rounded-lg border border-[#E8E1D8] text-sm hover:bg-[#F7F4EF]"
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-7 text-xs font-semibold text-slate-500">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="py-2 text-center">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDow(viewYear, viewMonth) }).map((_, i) => (
                  <div key={`pad-${i}`} className="h-12" />
                ))}

                {Array.from({ length: daysInMonth(viewYear, viewMonth) }).map((_, i) => {
                  const day = i + 1;
                  const dStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
                  const booked = isBooked(dStr);

                  const selected = startDate && !endDate && dStr === startDate;
                  const inSelRange =
                    startDate &&
                    endDate &&
                    parse(dStr).getTime() >= parse(startDate).getTime() &&
                    parse(dStr).getTime() <= parse(endDate).getTime();

                  return (
                    <button
                      key={dStr}
                      onClick={() => selectDay(viewYear, viewMonth, day)}
                      disabled={booked}
                      className={[
                        "h-12 rounded-lg border text-sm flex items-center justify-center transition",
                        booked
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed line-through border-slate-200"
                          : "hover:bg-[#F7F4EF] border-[#E8E1D8]",
                        selected ? "ring-2 ring-[#1F3A2E]" : "",
                        inSelRange ? "bg-[#E8E1D8]" : "",
                      ].join(" ")}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 grid items-end gap-3 sm:grid-cols-3 text-sm">
                <label className="flex flex-col">
                  <span className="font-medium">Start</span>
                  <input
                    type="text"
                    value={startDate}
                    readOnly
                    placeholder="Select on calendar"
                    className="mt-1 rounded-xl border border-[#E8E1D8] px-3 py-2"
                  />
                </label>
                <label className="flex flex-col">
                  <span className="font-medium">End</span>
                  <input
                    type="text"
                    value={endDate}
                    readOnly
                    placeholder="Select on calendar"
                    className="mt-1 rounded-xl border border-[#E8E1D8] px-3 py-2"
                  />
                </label>
                <label className="flex flex-col">
                  <span className="font-medium">Guests</span>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value || "1", 10))}
                    className="mt-1 rounded-xl border border-[#E8E1D8] px-3 py-2"
                  />
                </label>
              </div>

              <div className="mt-4 rounded-xl border border-[#E8E1D8] bg-[#F7F4EF] p-4 text-sm">
                <p className="font-medium text-[#1F3A2E]">Estimated total</p>
                <p className="mt-1 text-slate-700">
                  {nights} night{nights === 1 ? "" : "s"} × ${nightlyRate}
                </p>
                <p className="mt-2 text-2xl font-bold text-[#1F3A2E]">
                  ${lodging.toFixed(2)}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    track("calendar_clear");
                  }}
                  className="rounded-xl border border-[#E8E1D8] px-5 py-2 font-semibold text-sm hover:bg-[#F7F4EF]"
                >
                  Clear
                </button>

                <button
                  onClick={() => {
                    track("book_on_airbnb_click", {
                      startDate,
                      endDate,
                      guests: String(guests),
                    });
                    window.open(buildAirbnbUrl(), "_blank", "noopener");
                  }}
                  disabled={!startDate || !endDate}
                  className={`rounded-xl px-5 py-2 text-sm font-semibold shadow ${
                    !startDate || !endDate
                      ? "cursor-not-allowed bg-slate-300 text-white"
                      : "bg-[#1F3A2E] text-white hover:bg-[#183024] active:scale-[.99]"
                  }`}
                >
                  Book on Airbnb
                </button>

                <a
                  href={buildAirbnbUrl()}
                  target="_blank"
                  rel="noopener"
                  onClick={() =>
                    track("view_listing_click", {
                      startDate,
                      endDate,
                      guests: String(guests),
                    })
                  }
                  className="rounded-xl border border-[#E8E1D8] px-5 py-2 text-sm font-semibold hover:bg-[#F7F4EF]"
                >
                  View listing
                </a>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Bookings and payments for lodging are completed on Airbnb. Actual availability,
                taxes, and fees are shown at Airbnb checkout.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-[#E8E1D8] bg-white p-6 shadow-[0_12px_28px_rgba(0,0,0,.06)]">
              <h3 className="font-serif text-lg font-bold text-[#1F3A2E]">
                Good to know
              </h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
                <li>Select start and end dates directly on the calendar.</li>
                <li>Booked dates are grayed out.</li>
                <li>
                  Need help? Email <span className="font-medium">oldbluefarm@gmail.com</span>.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="max-w-6xl mx-auto mb-16 mt-12 px-4">
        <div className="rounded-2xl border border-[#E8E1D8] bg-white p-6 shadow-[0_12px_28px_rgba(0,0,0,.06)]">
          <h2 className="font-serif text-xl font-bold text-[#1F3A2E]">
            Get in touch
          </h2>
          <div className="mt-3 grid gap-4 text-sm md:grid-cols-3">
            <p><span className="font-semibold">Email:</span> oldbluefarm@gmail.com</p>
            <p><span className="font-semibold">Phone:</span> (435) 590-3138</p>
            <p><span className="font-semibold">Location:</span> Enoch, Utah</p>
          </div>
        </div>
      </section>

      <footer className="py-10 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} The Family Farm • All rights reserved
      </footer>
    </div>
  );
}


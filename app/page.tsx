// app/page.tsx
"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import InfiniteStrip from "./components/InfiniteStrip";
import Lightbox from "./components/Lightbox";

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

  // ------- Slim belt images + lightbox -------
  const beltImages = [
    "/hero/Exterior East.jpg",
    "/hero/Exterior North.jpg",
    "/hero/Main entrance.jpg",
    "/hero/North Exterior with Lawn.JPG",
    "/hero/Garden 4.JPG",
    "/hero/Great Room 3.jpg",
    "/hero/kitchen 2.jpg",
    "/hero/Sunflowers.jpg",
  ];
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);
  const openLb = (i: number) => {
    setLbIndex(i);
    setLbOpen(true);
  };
  const nextLb = () => setLbIndex((i) => (i + 1) % beltImages.length);
  const prevLb = () =>
    setLbIndex((i) => (i - 1 + beltImages.length) % beltImages.length);

  // ------- Availability (Airbnb sync) -------
  type Block = { start: string; end: string };
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [blocksLoading, setBlocksLoading] = useState(true);
  const [blocksError, setBlocksError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/airbnb")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setBlocks(Array.isArray(d.ranges) ? d.ranges : []);
        setBlocksError(d.error ?? null);
      })
      .catch((e) => setBlocksError(String(e)))
      .finally(() => active && setBlocksLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const isBooked = (dateStr: string) => {
    const d = parse(dateStr);
    return blocks.some((r) => betweenInclusive(d, parse(r.start), parse(r.end)));
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
  const buildAirbnbUrl = () => buildAirbnbUrlWith(startDate, endDate, guests);

  // ------- Page -------
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-emerald-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image
                src="/W-FamilyFarms-Enoch.jpg"
                alt="The Family Farm logo"
                fill
                sizes="40px"
                style={{ objectFit: "cover", borderRadius: "0.5rem" }}
                priority
              />
            </div>
            <span className="font-semibold text-lg text-emerald-900">
              The Family Farm
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#book" className="hover:text-emerald-700">
              Availability
            </a>
            <a href="/experiences" className="hover:text-emerald-700">
              Experiences
            </a>
            <a href="#contact" className="hover:text-emerald-700">
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* Slim, slowly moving belt */}
      <section className="w-full border-y border-emerald-100 bg-white/60 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <InfiniteStrip
            images={beltImages}
            speedSeconds={60} // slow crawl; raise if you want even slower
            onClick={(i: number) => openLb(i)}
          />
        </div>
      </section>

      {/* Intro blurb */}
      <section className="max-w-6xl mx-auto px-4 pt-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-emerald-900">
              A cozy farmstay in <span className="text-emerald-600">Enoch, Utah</span>
            </h1>
            <p className="mt-4 text-slate-600 text-lg">
              Unplug on our family hobby farm—wake to sheep bleating and chickens
              clucking, stroll the orchard, and sleep under endless skies.
            </p>
            <ul className="mt-4 text-slate-700 list-disc pl-5 space-y-1">
              <li>2-bedroom guesthouse · Wi-Fi · Full kitchen</li>
              <li>Private patio + firepit · Free parking</li>
              <li>Minutes to Cedar City · Near Zion &amp; Bryce Canyon</li>
            </ul>
          </div>
          <div>
            <img
              src="/hero/Great Room 3.jpg"
              alt="Cozy great room at The Family Farm"
              className="aspect-[4/3] w-full rounded-2xl object-cover shadow-lg"
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
            <div className="p-6 rounded-2xl bg-white shadow-sm border border-emerald-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Availability</h2>
                <div className="text-xs text-slate-500">
                  {blocksLoading
                    ? "Syncing with Airbnb…"
                    : blocksError
                    ? "Sync error — showing blanks"
                    : "Synced with Airbnb"}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goMonth(-1)}
                    className="px-2 py-1 rounded-lg border hover:bg-emerald-50"
                  >
                    Prev
                  </button>
                  <div className="w-48 text-center text-sm font-medium">
                    {new Date(viewYear, viewMonth, 1).toLocaleString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <button
                    onClick={() => goMonth(1)}
                    className="px-2 py-1 rounded-lg border hover:bg-emerald-50"
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-7 text-xs font-semibold text-slate-500">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="py-2 text-center">
                    {d}
                  </div>
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
                      className={[
                        "h-12 rounded-lg border text-sm flex items-center justify-center",
                        booked
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed line-through"
                          : "hover:bg-emerald-50",
                        selected ? "ring-2 ring-emerald-500" : "",
                        inSelRange ? "bg-emerald-100" : "",
                      ].join(" ")}
                      disabled={booked}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-emerald-100 border" /> Selected range
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-slate-100 border" /> Booked
                </span>
              </div>

              <div className="mt-6 grid items-end gap-3 sm:grid-cols-3">
                <label className="flex flex-col text-sm">
                  <span className="font-medium">Start</span>
                  <input
                    type="text"
                    value={startDate}
                    readOnly
                    placeholder="Select on calendar"
                    className="mt-1 rounded-xl border px-3 py-2"
                  />
                </label>
                <label className="flex flex-col text-sm">
                  <span className="font-medium">End</span>
                  <input
                    type="text"
                    value={endDate}
                    readOnly
                    placeholder="Select on calendar"
                    className="mt-1 rounded-xl border px-3 py-2"
                  />
                </label>
                <label className="flex flex-col text-sm">
                  <span className="font-medium">Guests</span>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value || "1", 10))}
                    className="mt-1 rounded-xl border px-3 py-2"
                  />
                </label>
              </div>

              <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm">
                <p className="font-medium">Estimated total</p>
                <p className="mt-1 text-slate-700">
                  {nights} night{nights === 1 ? "" : "s"} × ${nightlyRate}
                </p>
                <p className="mt-2 text-2xl font-bold">${lodging.toFixed(2)}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="rounded-xl border px-5 py-2 font-semibold hover:bg-emerald-50"
                >
                  Clear
                </button>
                <button
                  onClick={() => window.open(buildAirbnbUrl(), "_blank", "noopener")}
                  disabled={!startDate || !endDate}
                  className={`rounded-xl px-5 py-2 text-white font-semibold shadow ${
                    !startDate || !endDate
                      ? "cursor-not-allowed bg-slate-300"
                      : "bg-emerald-600 hover:bg-emerald-700 active:scale-[.99]"
                  }`}
                >
                  Book on Airbnb
                </button>
                <a
                  href={buildAirbnbUrl()}
                  target="_blank"
                  rel="noopener"
                  className="rounded-xl border px-5 py-2 font-semibold hover:bg-emerald-50"
                >
                  View listing
                </a>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Bookings and payments for lodging are completed on Airbnb. Actual
                availability, taxes, and fees are shown at Airbnb checkout.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold">Good to know</h3>
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

      {/* Lightbox for the belt */}
      <Lightbox
        open={lbOpen}
        images={beltImages}
        index={lbIndex}
        onClose={() => setLbOpen(false)}
        onPrev={prevLb}
        onNext={nextLb}
      />

      {/* Footer */}
      <footer className="py-10 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} The Family Farm • All rights reserved
      </footer>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import HeroCarousel from './components/HeroCarousel';

export default function FarmstaySite() {
  const airbnbListingId = '35318624';

  // ---- Hero slides (use .jpg/.jpeg files) ----
  // Put your images under /public/images/hero (they already are).
  // Avoid .HEIC in the carousel; browsers don’t render them.
  const heroSlides = [
    {
      src: '/images/hero/Exterior backyard summer time.jpg',
      alt: 'Barn and pergola on a sunny day',
    },
    {
      src: '/images/hero/Exterior backyard.jpeg',
      alt: 'Backyard and white fence',
    },
    {
      src: '/images/hero/barn small entrance.jpg',
      alt: 'Small barn entrance with welcome mat',
    },
    {
      src: '/images/hero/barn south side.jpg',
      alt: 'Barn south side with mountain backdrop',
    },
    {
      src: '/images/hero/Exterior main entrance.jpeg',
      alt: 'Main entrance of the barn',
    },
  ];

  // ---- Utils ----
  const pad = (n: number) => String(n).padStart(2, '0');
  const ymd = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s: string) => {
    const [Y, M, D] = s.split('-').map((x) => parseInt(x, 10));
    return new Date(Y, M - 1, D);
  };
  const betweenInclusive = (d: Date, a: Date, b: Date) =>
    d.getTime() >= a.getTime() && d.getTime() <= b.getTime();

  // ---- Airbnb URL helper (pure) ----
  const buildAirbnbUrlWith = (s?: string, e?: string, g?: number): string => {
    const base = `https://www.airbnb.com/rooms/${airbnbListingId}`;
    if (!s || !e) return base;
    const qs = new URLSearchParams({
      check_in: s,
      check_out: e,
      adults: String(g ?? 1),
      children: '0',
      infants: '0',
      pets: '0',
    }).toString();
    return `${base}?${qs}`;
  };

  // ---- Availability (placeholder ranges; can be replaced with Airbnb iCal) ----
  const bookedRanges: Array<{ start: string; end: string }> = [
    { start: '2025-09-18', end: '2025-09-20' },
    { start: '2025-10-05', end: '2025-10-08' },
  ];
  const isBooked = (dateStr: string) => {
    const d = parse(dateStr);
    return bookedRanges.some((r) =>
      betweenInclusive(d, parse(r.start), parse(r.end)),
    );
  };

  // ---- Calendar state ----
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-11
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guests, setGuests] = useState(2);

  const nights =
    startDate && endDate
      ? Math.max(
          0,
          Math.ceil(
            (parse(endDate).getTime() - parse(startDate).getTime()) /
              (1000 * 60 * 60 * 24),
          ),
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
      setEndDate('');
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

  // ---- Survey + QR ----
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [surveyDone, setSurveyDone] = useState(false);
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [email, setEmail] = useState('');
  const discountCode = 'FARMTHANKS10';
  const qrData = `https://thefamilyfarm.net/thanks?code=${discountCode}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    qrData,
  )}`;
  const submitSurvey = () => {
    if (!rating) return alert('Please select a rating before submitting.');
    setSurveyDone(true);
  };

  // ---- Sanity tests ----
  useEffect(() => {
    try {
      const base = `https://www.airbnb.com/rooms/${airbnbListingId}`;
      console.assert(buildAirbnbUrlWith('', '', 2) === base, '[TEST] Base URL');
      const u = buildAirbnbUrlWith('2025-09-16', '2025-09-21', 2);
      console.assert(u.includes('check_in=2025-09-16'), '[TEST] check_in');
      console.assert(u.includes('check_out=2025-09-21'), '[TEST] check_out');
      console.assert(u.includes('adults=2'), '[TEST] adults=2');
      const u2 = buildAirbnbUrlWith('2025-10-01', '2025-10-02', undefined);
      console.assert(u2.includes('adults=1'), '[TEST] default adults=1');
    } catch (e) {
      console.warn('Sanity tests failed:', e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-emerald-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600" />
            <span className="font-semibold text-lg">The Family Farm</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#book" className="hover:text-emerald-700">
              Availability
            </a>
            <a href="#contact" className="hover:text-emerald-700">
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-10 md:pt-16">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-emerald-900">
              A cozy farmstay in{' '}
              <span className="text-emerald-600">Enoch, Utah</span>
            </h1>
            <p className="mt-4 text-slate-600 text-lg">
              Unplug on our family hobby farm—wake to sheep bleating and
              chickens clucking, stroll the orchard, and sleep under endless
              skies.
            </p>
            <ul className="mt-4 text-slate-700 list-disc pl-5 space-y-1">
              <li>2-bedroom guesthouse · Wi-Fi · Full kitchen</li>
              <li>Private patio + firepit · Free parking</li>
              <li>Minutes to Cedar City · Near Zion & Bryce Canyon</li>
            </ul>
            <div className="mt-6">
              <button
                onClick={() => setSurveyOpen(true)}
                className="px-4 py-2 rounded-xl border font-semibold hover:bg-emerald-50"
              >
                Guest Satisfaction Survey
              </button>
            </div>
          </div>

          <div>
            <HeroCarousel slides={heroSlides} interval={5000} />
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goMonth(-1)}
                    className="px-2 py-1 rounded-lg border hover:bg-emerald-50"
                  >
                    Prev
                  </button>
                  <div className="text-sm font-medium w-48 text-center">
                    {new Date(viewYear, viewMonth, 1).toLocaleString(
                      undefined,
                      { month: 'long', year: 'numeric' },
                    )}
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
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="py-2 text-center">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDow(viewYear, viewMonth) }).map(
                  (_, i) => (
                    <div key={`pad-${i}`} className="h-12" />
                  ),
                )}
                {Array.from({ length: daysInMonth(viewYear, viewMonth) }).map(
                  (_, i) => {
                    const day = i + 1;
                    const dStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(
                      day,
                    )}`;
                    const booked = isBooked(dStr);
                    const selected =
                      startDate && !endDate && dStr === startDate;
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
                          'h-12 rounded-lg border text-sm flex items-center justify-center',
                          booked
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                            : 'hover:bg-emerald-50',
                          selected ? 'ring-2 ring-emerald-500' : '',
                          inSelRange ? 'bg-emerald-100' : '',
                        ].join(' ')}
                        disabled={booked}
                      >
                        {day}
                      </button>
                    );
                  },
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-100 border" />{' '}
                  Selected range
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-slate-100 border" />{' '}
                  Booked
                </span>
              </div>

              <div className="mt-6 grid sm:grid-cols-3 gap-3 items-end">
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
                    onChange={(e) =>
                      setGuests(parseInt(e.target.value || '1', 10))
                    }
                    className="mt-1 rounded-xl border px-3 py-2"
                  />
                </label>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-sm">
                <p className="font-medium">Estimated total</p>
                <p className="mt-1 text-slate-700">
                  {nights} night{nights === 1 ? '' : 's'} × ${nightlyRate}
                </p>
                <p className="mt-2 text-2xl font-bold">
                  ${lodging.toFixed(2)}
                </p>
              </div>

              <div className="mt-4 flex gap-3 flex-wrap">
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="px-5 py-2 rounded-xl border font-semibold hover:bg-emerald-50"
                >
                  Clear
                </button>
                <button
                  onClick={() =>
                    window.open(buildAirbnbUrl(), '_blank', 'noopener')
                  }
                  disabled={!startDate || !endDate}
                  className={`px-5 py-2 rounded-xl text-white font-semibold shadow ${
                    !startDate || !endDate
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[.99]'
                  }`}
                >
                  Book on Airbnb
                </button>
                <a
                  href={buildAirbnbUrl()}
                  target="_blank"
                  rel="noopener"
                  className="px-5 py-2 rounded-xl border font-semibold hover:bg-emerald-50"
                >
                  View listing
                </a>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Bookings and payments for lodging are completed on Airbnb.
                Actual availability, taxes, and fees are shown at Airbnb
                checkout.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-2xl bg-white shadow-sm border border-emerald-100">
              <h3 className="text-lg font-bold">Good to know</h3>
              <ul className="mt-3 text-sm text-slate-700 list-disc pl-5 space-y-1">
                <li>Select start and end dates directly on the calendar.</li>
                <li>Booked dates are grayed out.</li>
                <li>
                  Need help? Email{' '}
                  <span className="font-medium">oldbluefarm@gmail.com</span>.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact + Survey */}
      <section id="contact" className="max-w-6xl mx-auto px-4 mt-12 mb-16">
        <div className="p-6 rounded-2xl bg-white shadow-sm border border-emerald-100">
          <h2 className="text-xl font-bold">Get in touch</h2>
          <div className="mt-3 grid md:grid-cols-3 gap-4 text-sm">
            <p>
              <span className="font-semibold">Email:</span>{' '}
              oldbluefarm@gmail.com
            </p>
            <p>
              <span className="font-semibold">Phone:</span> (435) 555-0123
            </p>
            <p>
              <span className="font-semibold">Location:</span> Enoch, Utah
            </p>
          </div>
          <div className="mt-4">
            <button
              onClick={() => setSurveyOpen(true)}
              className="px-4 py-2 rounded-xl border font-semibold hover:bg-emerald-50"
            >
              Open Satisfaction Survey
            </button>
          </div>
        </div>
      </section>

      {/* Survey Modal */}
      {surveyOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border shadow-lg p-6">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold">Participant Satisfaction Survey</h3>
              <button
                onClick={() => setSurveyOpen(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {!surveyDone ? (
              <div className="mt-4 space-y-4">
                <label className="block text-sm">
                  <span className="font-medium">How was your stay?</span>
                  <div className="mt-1 flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setRating(n)}
                        className={`w-10 h-10 rounded-xl border ${
                          rating >= n ? 'bg-emerald-100' : 'hover:bg-emerald-50'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </label>
                <label className="block text-sm">
                  <span className="font-medium">Comments (optional)</span>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="mt-1 w-full rounded-xl border px-3 py-2 min-h-[80px]"
                    placeholder="Tell us what you loved and what we can improve"
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-medium">Email (optional)</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                    placeholder="you@example.com"
                  />
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={submitSurvey}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => setSurveyOpen(false)}
                    className="px-4 py-2 rounded-xl border font-semibold hover:bg-emerald-50"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  By submitting, you agree to be contacted about your stay if
                  you provide an email.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <p className="text-sm">
                  Thank you! Scan this QR code to claim your discount.
                </p>
                <img
                  src={qrUrl}
                  alt="QR code for discount"
                  className="w-[240px] h-[240px] rounded-xl border mx-auto"
                />
                <div className="text-center">
                  <p className="text-sm">Discount code:</p>
                  <p className="text-2xl font-extrabold tracking-wider">
                    {discountCode}
                  </p>
                </div>
                <div className="text-center">
                  <button
                    onClick={() => setSurveyOpen(false)}
                    className="mt-2 px-4 py-2 rounded-xl border font-semibold hover:bg-emerald-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="py-10 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} The Family Farm • All rights reserved
      </footer>
    </div>
  );
}

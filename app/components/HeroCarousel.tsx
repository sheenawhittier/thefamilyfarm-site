'use client';

import { useEffect, useRef, useState } from 'react';

type Slide = {
  src: string;
  alt: string;
  /** optional object-position helper */
  focal?: 'top' | 'center' | 'bottom';
};

export default function HeroCarousel({
  slides,
  interval = 5000,
}: {
  slides: Slide[];
  interval?: number;
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<number | null>(null);

  // auto-advance
  useEffect(() => {
    if (paused || slides.length <= 1) return;

    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, interval);

    return () => window.clearInterval(id); // <- cleanup returns void
  }, [interval, paused, slides.length]);

  const go = (n: number) =>
    setActive((p) => (p + n + slides.length) % slides.length);

  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-lg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((s, i) => (
        <img
          key={s.src}
          src={s.src}
          alt={s.alt}
          className={[
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-700',
            s.focal === 'top'
              ? 'object-top'
              : s.focal === 'bottom'
              ? 'object-bottom'
              : 'object-center',
            i === active ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        />
      ))}

      {/* arrows */}
      <button
        aria-label="Previous"
        onClick={() => go(-1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-700 shadow hover:bg-white"
      >
        ‹
      </button>
      <button
        aria-label="Next"
        onClick={() => go(1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-700 shadow hover:bg-white"
      >
        ›
      </button>

      {/* dots */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setActive(i)}
            className={`h-2 w-2 rounded-full ${
              i === active ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

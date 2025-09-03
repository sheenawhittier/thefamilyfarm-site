"use client";
import { useEffect, useRef, useState } from "react";

export type Slide = { src: string; alt?: string };

type Props = { slides: Slide[]; interval?: number };

export default function HeroCarousel({ slides, interval = 5000 }: Props) {
  const [active, setActive] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (slides.length === 0) return;
    timer.current = window.setInterval(() => {
      setActive(i => (i + 1) % slides.length);
    }, interval);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [slides, interval]);

  if (slides.length === 0) return null;

  const prev = () => setActive(i => (i - 1 + slides.length) % slides.length);
  const next = () => setActive(i => (i + 1) % slides.length);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border shadow">
      {slides.map((s, i) => (
        <img
          key={s.src}
          src={s.src}
          alt={s.alt ?? ""}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
          loading={i === 0 ? "eager" : "lazy"}
        />
      ))}
      <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-2 py-1">‹</button>
      <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-2 py-1">›</button>
    </div>
  );
}



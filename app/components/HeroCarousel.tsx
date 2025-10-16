'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState, useCallback } from 'react';

type Slide = { src: string; alt: string; caption?: string };

export default function HeroCarousel() {
  // app/components/HeroCarousel.tsx (only the slides array)
const slides: Slide[] = useMemo(() => ([
  { src: '/hero/Exterior East.jpg',              alt: 'Barn exterior, east side',  caption: 'The Family Farm · cozy farm stay' },
  { src: '/hero/Exterior North.jpg',            alt: 'Barn exterior, north view', caption: 'Quiet mornings, big skies' },
  { src: '/hero/Main entrance.jpg',             alt: 'Main entrance',             caption: 'Welcome to your getaway' },
  { src: '/hero/North Exterior with Lawn.JPG',  alt: 'North lawn',                caption: 'Room to roam' },
  { src: '/hero/Garden 4.JPG',                  alt: 'Garden path',               caption: 'Fresh air & garden walks' },
  { src: '/hero/Great Room 3.jpg',              alt: 'Great room',                caption: 'Cozy spaces to gather' },
  { src: '/hero/kitchen 2.jpg',                 alt: 'Kitchen',                   caption: 'Cook, chat, unwind' },
  { src: '/hero/Sunflowers.jpg',                alt: 'Sunflowers',                caption: 'Golden-hour views' },
]), []);

  const [index, setIndex] = useState(0);
  const next = useCallback(() => setIndex(i => (i + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setIndex(i => (i - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(next, 6500); // calm pace
    return () => clearInterval(t);
  }, [next, slides.length]);

  return (
    <section className="container" style={{ paddingTop: '1rem' }} aria-label="Farm stay photo highlights">
      <div className="hero-carousel">
        {slides.map((s, i) => (
          <div key={s.src} className={`hero-slide ${i === index ? 'active' : ''}`} aria-hidden={i !== index}>
            <Image
              src={s.src}
              alt={s.alt}
              fill
              sizes="100vw"
              priority={i === 0}
              className="hero-image"
              style={{ objectFit: 'cover' }}
            />
            <div className="hero-overlay" />
            {s.caption && <p className="hero-caption">{s.caption}</p>}
          </div>
        ))}
        {slides.length > 1 && (
          <>
            <button className="hero-arrow prev" onClick={prev} aria-label="Previous slide">‹</button>
            <button className="hero-arrow next" onClick={next} aria-label="Next slide">›</button>
          </>
        )}
        {slides.length > 1 && (
          <div className="hero-dots" role="tablist" aria-label="Select slide">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`hero-dot ${i === index ? 'active' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

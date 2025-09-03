"use client";
type Props = {
  images: string[];
  speedSeconds?: number;
  onClick?: (index: number) => void;
};

export default function InfiniteStrip({ images, speedSeconds = 38, onClick }: Props) {
  if (!images?.length) return null;
  const belt = [...images, ...images]; // duplicate for seamless loop
  const duration = `${speedSeconds}s`;

  return (
    <div className="relative overflow-hidden">
      <div
        className="flex min-w-max animate-[marquee_linear_infinite]"
        style={{ animationDuration: duration }}
      >
        {belt.map((src, i) => (
          <button
            key={`${src}-${i}`}
            className="mx-2 shrink-0"
            onClick={() => onClick?.(i % images.length)}
          >
            <img
              src={src}
              alt=""
              className="h-24 w-36 rounded-lg object-cover shadow-sm"
              loading="lazy"
            />
          </button>
        ))}
      </div>
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .animate-[marquee_linear_infinite] {
          animation-name: marquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
}

"use client";
type Props = {
  open: boolean;
  images: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function Lightbox({ open, images, index, onClose, onPrev, onNext }: Props) {
  if (!open || !images.length) return null;
  const src = images[index];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 p-4">
      <button className="absolute right-4 top-4 rounded bg-white/80 px-3 py-1" onClick={onClose}>Close</button>
      <button className="absolute left-4 top-1/2 -translate-y-1/2 rounded bg-white/80 px-3 py-1" onClick={onPrev}>‹</button>
      <button className="absolute right-4 top-1/2 -translate-y-1/2 rounded bg-white/80 px-3 py-1" onClick={onNext}>›</button>
      <img src={src} alt="" className="mx-auto max-h-[90vh] rounded object-contain" />
    </div>
  );
}

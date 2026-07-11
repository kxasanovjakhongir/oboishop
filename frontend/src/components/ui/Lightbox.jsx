import { useEffect, useRef, useState } from 'react';

const SWIPE_THRESHOLD = 50;

export default function Lightbox({ images, initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const lastTapRef = useRef(0);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [images.length, onClose]);

  if (!images?.length) return null;

  const goTo = (i) => {
    setZoomed(false);
    setIndex(i);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Ignore mostly-vertical drags so swipe-to-navigate doesn't fight
    // scrolling/dismissing, and skip entirely while zoomed in (the browser's
    // native pinch-zoom needs those gestures for panning instead).
    if (!zoomed && Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0 && images.length > 1) goTo((index + 1) % images.length);
      else if (dx > 0 && images.length > 1) goTo((index - 1 + images.length) % images.length);
      return;
    }

    // Double-tap to toggle a 2x zoom — full multi-touch pinch/pan is left to
    // the browser's native pinch-zoom (never disabled on this page), this
    // just adds the quick "tap twice to zoom in" affordance mobile users
    // expect from photo viewers.
    const now = Date.now();
    if (now - lastTapRef.current < 300) setZoomed((z) => !z);
    lastTapRef.current = now;
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 sm:p-6"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      onClick={onClose}
    >
      <div
        className="relative max-w-xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 sm:-top-3 sm:-right-3 w-11 h-11 sm:w-9 sm:h-9 rounded-full bg-white text-stone-600 shadow-lg flex items-center justify-center hover:text-orange-600 active:scale-95 transition-all z-10 touch-manipulation"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {images.length > 1 && (
          <button
            onClick={() => goTo((index - 1 + images.length) % images.length)}
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 text-stone-600 shadow items-center justify-center hover:text-orange-600 active:scale-95 transition-all touch-manipulation"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <div
          className="overflow-hidden rounded-2xl bg-white touch-manipulation"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={images[index]}
            alt=""
            className={`w-auto h-auto max-w-full max-h-[70vh] mx-auto object-contain shadow-2xl transition-transform duration-300 ${zoomed ? 'scale-[2] cursor-zoom-out' : 'cursor-zoom-in'}`}
            style={{ imageRendering: 'auto' }}
          />
        </div>

        {images.length > 1 && (
          <button
            onClick={() => goTo((index + 1) % images.length)}
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 text-stone-600 shadow items-center justify-center hover:text-orange-600 active:scale-95 transition-all touch-manipulation"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {images.length > 1 && (
          <div className="flex sm:hidden items-center justify-center gap-1.5 mt-3">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`${i + 1}`}
                className={`h-1.5 rounded-full transition-all touch-manipulation ${i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

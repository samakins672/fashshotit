import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { MediaItem } from "../data/site";

interface LightboxProps {
  items: MediaItem[];
  index: number | null;
  onChange: (index: number | null) => void;
}

export default function Lightbox({ items, index, onChange }: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = index !== null && items[index] !== undefined;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.classList.add("no-scroll");

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onChange(null);
      if (items.length > 1 && e.key === "ArrowRight") onChange(((index ?? 0) + 1) % items.length);
      if (items.length > 1 && e.key === "ArrowLeft") onChange(((index ?? 0) - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("no-scroll");
      previouslyFocused?.focus();
    };
  }, [open, index, items.length, onChange]);

  if (!open) return null;
  const item = items[index];
  const step = (d: number) => onChange((index + d + items.length) % items.length);

  return createPortal(
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={item.caption ?? "Media viewer"} onClick={() => onChange(null)}>
      <button ref={closeRef} type="button" className="lightbox-close" aria-label="Close" onClick={() => onChange(null)}>
        ×
      </button>
      {items.length > 1 && (
        <>
          <button
            type="button"
            className="lightbox-nav lightbox-prev"
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
          >
            ‹
          </button>
          <button
            type="button"
            className="lightbox-nav lightbox-next"
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
          >
            ›
          </button>
        </>
      )}
      <figure className="lightbox-figure" onClick={(e) => e.stopPropagation()}>
        {item.type === "image" ? (
          <img key={item.src} src={item.src} alt={item.caption ?? ""} />
        ) : (
          <div className="lightbox-video">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${item.id}?autoplay=1&rel=0`}
              title={item.caption ?? "Video"}
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
        {(item.caption || items.length > 1) && (
          <figcaption>
            {item.caption}
            {items.length > 1 && <span className="lightbox-count">{`${index + 1} / ${items.length}`}</span>}
          </figcaption>
        )}
      </figure>
    </div>,
    document.body,
  );
}

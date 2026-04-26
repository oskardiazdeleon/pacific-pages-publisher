import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";

export function ListingGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  if (!images.length) return null;

  const close = () => setOpenIdx(null);
  const prev = () =>
    setOpenIdx((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  const next = () =>
    setOpenIdx((i) => (i === null ? null : (i + 1) % images.length));

  // Layout: large left + grid right (Airbnb-style) for 3+ images, simple grid otherwise.
  const showHero = images.length >= 3;
  const sideImages = showHero ? images.slice(1, 5) : images;

  return (
    <>
      <div className="relative grid grid-cols-1 gap-2 overflow-hidden rounded-3xl md:grid-cols-2 md:gap-2">
        {showHero && (
          <button
            type="button"
            onClick={() => setOpenIdx(0)}
            className="group relative aspect-[4/3] overflow-hidden md:aspect-auto md:row-span-2"
          >
            <img
              src={images[0]}
              alt={`${name} photo 1`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </button>
        )}
        <div
          className={`grid gap-2 ${
            showHero ? "grid-cols-2" : "grid-cols-2 md:col-span-2 md:grid-cols-4"
          }`}
        >
          {sideImages.map((src, i) => {
            const idx = showHero ? i + 1 : i;
            return (
              <button
                key={`${src}-${idx}`}
                type="button"
                onClick={() => setOpenIdx(idx)}
                className="group relative aspect-[4/3] overflow-hidden"
              >
                <img
                  src={src}
                  alt={`${name} photo ${idx + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </button>
            );
          })}
        </div>

        {images.length > 5 && (
          <button
            type="button"
            onClick={() => setOpenIdx(0)}
            className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-background/95 px-3.5 py-2 text-sm font-semibold shadow-md hover:bg-background"
          >
            <Images className="h-4 w-4" />
            Show all {images.length} photos
          </button>
        )}
      </div>

      {openIdx !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] grid place-items-center bg-black/90 p-4"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous"
            className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <img
            src={images[openIdx]}
            alt={`${name} photo ${openIdx + 1}`}
            className="max-h-[85vh] max-w-[92vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Next"
            className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
            {openIdx + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}

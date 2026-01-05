import { circularPhotos, type CircularPhoto } from "./data";
import { HOVER_SCALE_EFFECT } from "../../lib/constants";

interface NotesPhotosGalleryProps {
  photos?: CircularPhoto[];
}

export function NotesPhotosGallery({
  photos = circularPhotos,
}: NotesPhotosGalleryProps) {
  if (photos.length < 3) return null;

  return (
    <>
      {/* Desktop: Overlapping grid layout */}
      <div className="hidden lg:block">
        <div className="relative h-[239px] w-[512px]">
          {/* Photo 3 - bottom left */}
          <div
            className={`absolute left-0 top-0 h-[200px] w-[200px] overflow-hidden rounded-full ${HOVER_SCALE_EFFECT} hover:z-10`}
          >
            <img
              src={photos[2].src}
              alt={photos[2].alt}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          {/* Photo 2 - middle, offset down */}
          <div
            className={`absolute left-[156px] top-[39px] h-[200px] w-[200px] overflow-hidden rounded-full ${HOVER_SCALE_EFFECT} hover:z-10`}
          >
            <img
              src={photos[1].src}
              alt={photos[1].alt}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          {/* Photo 1 - top right */}
          <div
            className={`absolute left-[312px] top-0 h-[200px] w-[200px] overflow-hidden rounded-full ${HOVER_SCALE_EFFECT} hover:z-10`}
          >
            <img
              src={photos[0].src}
              alt={photos[0].alt}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>

      {/* Mobile: Horizontal overlapping layout */}
      <div className="flex justify-center lg:!hidden">
        <div className="flex items-start">
          {photos.slice(0, 3).map((photo, index) => (
            <div
              key={photo.src}
              className={`h-[120px] w-[120px] overflow-hidden rounded-full ${HOVER_SCALE_EFFECT} hover:z-10 sm:h-[150px] sm:w-[150px] ${
                index > 0 ? "-ml-6 sm:-ml-8" : ""
              } ${index === 1 ? "mt-6" : ""}`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

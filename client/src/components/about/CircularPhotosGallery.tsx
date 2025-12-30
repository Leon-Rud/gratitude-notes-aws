import { circularPhotos, type CircularPhoto } from "./data";

export interface CircularPhotosGalleryProps {
  photos?: CircularPhoto[];
}

export function CircularPhotosGallery({
  photos = circularPhotos,
}: CircularPhotosGalleryProps) {
  if (photos.length < 3) {
    return null;
  }

  return (
    <div className="flex shrink-0 items-start justify-center">
      {/* First circle - normal position */}
      <div className="h-[188px] w-[188px] shrink-0 overflow-hidden rounded-full">
        <img
          src={photos[0].src}
          alt={photos[0].alt}
          width={188}
          height={188}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Middle circle - positioned lower */}
      <div className="-ml-8 mt-12 h-[188px] w-[188px] shrink-0 overflow-hidden rounded-full">
        <img
          src={photos[1].src}
          alt={photos[1].alt}
          width={188}
          height={188}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Third circle - normal position */}
      <div className="-ml-8 h-[188px] w-[188px] shrink-0 overflow-hidden rounded-full">
        <img
          src={photos[2].src}
          alt={photos[2].alt}
          width={188}
          height={188}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

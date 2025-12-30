import { stickyNotes, type StickyNote } from "./data";

export interface StickyNotesCollageProps {
  notes?: StickyNote[];
}

export function StickyNotesCollage({
  notes = stickyNotes,
}: StickyNotesCollageProps) {
  return (
    <>
      {/* Desktop: absolute positioning */}
      <div className="relative hidden h-[489px] w-full overflow-hidden lg:block lg:max-w-[1228px]">
        {notes.map((note, index) => (
          <div
            key={note.src}
            className={`absolute overflow-hidden rounded-card ${
              note.width === 182 ? "h-[182px] w-[182px]" : "h-[220px] w-[220px]"
            }`}
            style={{
              left: note.left,
              top: note.top,
              zIndex: index + 1,
            }}
          >
            <img
              src={note.src}
              alt={note.alt}
              width={note.width}
              height={note.height}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Mobile: grid layout */}
      <div className="grid grid-cols-2 gap-4 lg:hidden">
        {notes.map((note) => (
          <div
            key={note.src}
            className="overflow-hidden rounded-card"
            style={{ aspectRatio: `${note.width} / ${note.height}` }}
          >
            <img
              src={note.src}
              alt={note.alt}
              width={note.width}
              height={note.height}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </>
  );
}

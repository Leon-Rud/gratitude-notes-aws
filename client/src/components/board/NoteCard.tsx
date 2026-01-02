import type { GratitudeNote } from "../../api/types";
import { EditIcon, DeleteIcon, SpinnerIcon } from "../ui/icons";
import { CARD_SHADOW } from "../../lib/constants";

interface NoteCardProps {
  note: GratitudeNote;
  isMyNote: boolean;
  onEdit: (note: GratitudeNote) => void;
  onDelete: (noteId: string) => void;
  isDeleting: boolean;
  maxVisibleLines?: number;
}

export function NoteCard({
  note,
  isMyNote,
  onEdit,
  onDelete,
  isDeleting,
  maxVisibleLines = 6,
}: NoteCardProps) {
  const lines = note.gratitudeText.split("\n");
  const visibleLines = lines.slice(0, maxVisibleLines);
  const remainingLines = lines.length - maxVisibleLines;

  return (
    <article className={`flex h-[336px] w-[336px] flex-col overflow-hidden rounded-card border-[1.5px] border-ui-glassBorder bg-ui-loginOverlay p-6 ${CARD_SHADOW} mix-blend-multiply backdrop-blur-glass`}>
      <header className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="break-words font-poppins text-[20px] font-normal leading-normal text-white">
            {note.name}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-0">
          {isMyNote && (
            <>
              <button
                type="button"
                onClick={() => onEdit(note)}
                className="rounded px-1 py-1.5 text-white/70 transition-opacity hover:text-white hover:opacity-100"
                aria-label="Edit note"
                title="Edit note"
              >
                <EditIcon />
              </button>
              <button
                type="button"
                onClick={() => onDelete(note.id)}
                disabled={isDeleting}
                className="rounded px-1 py-1.5 text-white/70 transition-opacity hover:text-red-400 hover:opacity-100 disabled:opacity-50"
                aria-label="Delete note"
                title="Delete note"
              >
                {isDeleting ? <SpinnerIcon /> : <DeleteIcon />}
              </button>
            </>
          )}
        </div>
      </header>
      <div className="note-content max-h-[192px] flex-1 overflow-hidden whitespace-pre-wrap break-words font-poppins text-[20px] font-normal leading-[32px] text-white">
        {visibleLines.join("\n")}
        {remainingLines > 0 && (
          <p className="mt-auto text-right text-[12px] font-medium uppercase tracking-[0.2em] text-white/70">
            +{remainingLines} more...
          </p>
        )}
      </div>
    </article>
  );
}

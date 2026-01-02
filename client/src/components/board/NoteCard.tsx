import type { GratitudeNote } from "../../api/types";
import { EditIcon, DeleteIcon, SpinnerIcon } from "../ui/icons";

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
    <article className="flex h-[336px] w-[336px] flex-col overflow-hidden rounded-card border-[1.5px] border-white/10 bg-[rgba(95,82,178,0.35)] p-6 shadow-[0px_36px_10px_0px_rgba(0,0,0,0),0px_23px_9px_0px_rgba(0,0,0,0.01),0px_13px_8px_0px_rgba(0,0,0,0.05),0px_6px_6px_0px_rgba(0,0,0,0.09),0px_1px_3px_0px_rgba(0,0,0,0.1)] mix-blend-multiply backdrop-blur-glass">
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

import type { GratitudeNote } from "../../api/types";

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
    <article className="flex h-[336px] w-[336px] flex-col overflow-hidden rounded-[16px] border-[1.5px] border-transparent bg-[rgba(95,82,178,0.35)] p-6 shadow-[0px_36px_10px_0px_rgba(0,0,0,0),0px_23px_9px_0px_rgba(0,0,0,0.01),0px_13px_8px_0px_rgba(0,0,0,0.05),0px_6px_6px_0px_rgba(0,0,0,0.09),0px_1px_3px_0px_rgba(0,0,0,0.1)] backdrop-blur-[7.5px]">
      <header className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="break-words font-poppins text-[20px] font-normal leading-normal text-white">
            {note.name}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {isMyNote && (
            <>
              <button
                type="button"
                onClick={() => onEdit(note)}
                className="rounded p-1.5 text-white/70 transition-opacity hover:text-white hover:opacity-100"
                aria-label="Edit note"
                title="Edit note"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => onDelete(note.id)}
                disabled={isDeleting}
                className="rounded p-1.5 text-white/70 transition-opacity hover:text-red-400 hover:opacity-100 disabled:opacity-50"
                aria-label="Delete note"
                title="Delete note"
              >
                {isDeleting ? (
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
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

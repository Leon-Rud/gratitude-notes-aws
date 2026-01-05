import type { GratitudeNote } from "../../api/types";
import { EditIcon, DeleteIcon, SpinnerIcon } from "../ui/icons";
import { CARD_SHADOW } from "../../lib/constants";

interface NoteCardProps {
  note: GratitudeNote;
  isMyNote: boolean;
  onEdit: (note: GratitudeNote) => void;
  onDelete: (noteId: string) => void;
  isDeleting: boolean;
}

export function NoteCard({
  note,
  isMyNote,
  onEdit,
  onDelete,
  isDeleting,
}: NoteCardProps) {

  return (
    <article className={`flex h-[320px] w-[320px] flex-col overflow-hidden rounded-card border-[1.5px] border-ui-glassBorder bg-ui-loginOverlay p-6 ${CARD_SHADOW} mix-blend-multiply backdrop-blur-glass`}>
      <header className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="break-words font-poppins text-[20px] font-normal leading-normal text-white">
            {note.name}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-[9px]">
          {isMyNote && (
            <>
              <button
                type="button"
                onClick={() => onEdit(note)}
                className="text-white transition-opacity hover:opacity-70"
                aria-label="Edit note"
                title="Edit note"
              >
                <EditIcon />
              </button>
              <button
                type="button"
                onClick={() => onDelete(note.id)}
                disabled={isDeleting}
                className="text-white transition-opacity hover:opacity-70 disabled:opacity-50"
                aria-label="Delete note"
                title="Delete note"
              >
                {isDeleting ? <SpinnerIcon className="h-4 w-[15px] animate-spin" /> : <DeleteIcon />}
              </button>
            </>
          )}
        </div>
      </header>
      <div className="note-content flex-1 overflow-y-auto whitespace-pre-wrap break-words font-poppins text-[20px] font-normal leading-[32px] text-white">
        {note.gratitudeText}
      </div>
    </article>
  );
}

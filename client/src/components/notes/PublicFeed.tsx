import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { deleteNote, getTodayNotes } from "../../api/notes";
import type { GratitudeNote } from "../../api/types";
import { useAuth } from "../../contexts/AuthContext";
import { NoteSkeleton } from "./NoteSkeleton";
import { NoteFormCard } from "./NoteFormCard";

export function PublicFeed() {
  const { user } = useAuth();
  const MAX_VISIBLE_LINES = 6;
  const [notes, setNotes] = useState<GratitudeNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<GratitudeNote | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const isLoadingRef = useRef(false);

  // Get user's note ID from localStorage (with backwards compatibility)
  const userNoteId = localStorage.getItem("gratitude-user-note-id");
  // Check if user has a note in the loaded notes
  const userHasNote = !!userNoteId && notes.some((n) => n.id === userNoteId);

  // Show empty note if: not loading, notes have been loaded, and user doesn't have a note
  const shouldShowEmptyNote = !loading && notes.length >= 0 && !userHasNote;
  const addButtonDisabled = userHasNote;

  async function load() {
    // Prevent concurrent requests using ref (synchronous check)
    if (isLoadingRef.current) {
      return;
    }
    isLoadingRef.current = true;

    try {
      setLoading(true);
      setError(null);
      const res = await getTodayNotes();
      let items = res.items;

      // Always sort to show user's note first if they have one
      const currentUserNoteId = localStorage.getItem("gratitude-user-note-id");
      if (currentUserNoteId) {
        const userNoteIndex = items.findIndex(
          (n) => n.id === currentUserNoteId,
        );
        if (userNoteIndex >= 0) {
          // Move user's note to the front
          const userNote = items[userNoteIndex];
          items = [
            userNote,
            ...items.filter((n) => n.id !== currentUserNoteId),
          ];
        }
      }

      setNotes(items);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load";
      setError(message);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDeleteClick(noteId: string) {
    setDeletingNoteId(noteId);
  }

  function handleDeleteCancel() {
    setDeletingNoteId(null);
  }

  async function handleDeleteConfirm() {
    if (!deletingNoteId) return;

    // Deleting a note requires an owner token (backend enforces ?token=...).
    const token = localStorage.getItem(
      `gratitude-note-token-${deletingNoteId}`,
    );

    if (!token) {
      setError(
        "Unable to delete: Please refresh the page and try again. If you created this note from a different device, check your email for the delete link.",
      );
      setDeletingNoteId(null);
      return;
    }

    const noteIdToDelete = deletingNoteId;
    setDeletingNoteId(null);
    try {
      await deleteNote(noteIdToDelete, token);
      // Remove from localStorage
      localStorage.removeItem(`gratitude-note-${noteIdToDelete}`);
      localStorage.removeItem(`gratitude-note-token-${noteIdToDelete}`);
      // If this was the user's current note, clear it
      if (noteIdToDelete === userNoteId) {
        localStorage.removeItem("gratitude-user-note-id");
      }
      // Reload notes
      load();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to delete note";
      setError(message);
    }
  }

  return (
    <section className="space-y-4">
      {error && (
        <div className="rounded-lg border border-rose-500/60 bg-rose-500/10 p-4 text-sm text-rose-100">
          <p className="font-semibold">Oops! Something went wrong</p>
          <p className="mt-1 text-xs text-rose-100/80">{error}</p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              load();
            }}
            className="mt-3 rounded-md bg-rose-500/20 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-rose-500/30"
          >
            Try again
          </button>
        </div>
      )}
      {/* Figma cards are fixed 336x336 with large horizontal gaps on desktop. */}
      {/* Figma columns: x=37, 405, 773, 1141 => card gap = 32px (since 336 + 32 = 368). */}
      <div className="grid grid-cols-[repeat(auto-fit,336px)] justify-start gap-x-[32px] gap-y-[30px]">
        {loading && notes.length === 0 && (
          <>
            <NoteSkeleton />
            <NoteSkeleton />
            <NoteSkeleton />
            <NoteSkeleton />
            <NoteSkeleton />
            <NoteSkeleton />
          </>
        )}
        {/* Empty note card if user doesn't have a note */}
        <button
          type="button"
          onClick={() => {
            if (addButtonDisabled) return;
            setEditingNote(null);
            setShowForm(true);
          }}
          disabled={addButtonDisabled}
          className={`relative h-[336px] w-[336px] overflow-hidden rounded-[16px] border border-[rgba(255,255,255,0.12)] bg-[rgba(42,37,88,0.85)] mix-blend-luminosity shadow-[0px_36px_10px_0px_rgba(0,0,0,0),0px_23px_9px_0px_rgba(0,0,0,0.01),0px_13px_8px_0px_rgba(0,0,0,0.05),0px_6px_6px_0px_rgba(0,0,0,0.09),0px_1px_3px_0px_rgba(0,0,0,0.1)] ${
            addButtonDisabled
              ? "cursor-not-allowed opacity-60"
              : "transition-all hover:-translate-y-0.5"
          }`}
        >
          <p className="font-poppins absolute left-1/2 top-[32px] w-[272px] -translate-x-1/2 text-center text-[20px] font-normal leading-normal text-[#fff3e5]">
            {addButtonDisabled
              ? "Already shared gratitude today 🙏"
              : "Add your gratitude note"}
          </p>
          <div className="absolute left-1/2 top-1/2 h-[80px] w-[80px] -translate-x-1/2 -translate-y-1/2">
            <img
              src="/assets/icons/add-button-circle.svg"
              alt=""
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
            />
            <img
              src="/assets/icons/add-button-plus.svg"
              alt="Add note"
              className="absolute left-1/2 top-1/2 h-[28px] w-[28px] -translate-x-1/2 -translate-y-1/2"
            />
          </div>
        </button>
        {/* Empty-state dashed placeholder box from Figma */}
        {shouldShowEmptyNote && notes.length === 0 && !loading && (
          <div className="relative h-[336px] w-[336px] overflow-hidden rounded-[16px]">
            <svg className="pointer-events-none absolute inset-0 h-full w-full">
              <rect
                x="1"
                y="1"
                width="calc(100% - 2px)"
                height="calc(100% - 2px)"
                rx="16"
                ry="16"
                fill="none"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="1.5"
                strokeDasharray="18 14"
                strokeLinecap="round"
              />
            </svg>

            <p className="font-poppins absolute left-1/2 top-1/2 w-[272px] -translate-x-1/2 -translate-y-1/2 text-center text-[20px] font-normal leading-[24px] text-white">
              You&apos;ll see everyone&apos;s notes here once people start
              sharing.
            </p>
          </div>
        )}
        {notes.map((note) => {
          const isMyNote = note.id === userNoteId;

          return (
            <article
              key={note.id}
              className="flex h-[336px] w-[336px] flex-col overflow-hidden rounded-[16px] border border-[rgba(255,255,255,0.12)] bg-[rgba(42,37,88,0.85)] p-6 mix-blend-luminosity shadow-[0px_36px_10px_0px_rgba(0,0,0,0),0px_23px_9px_0px_rgba(0,0,0,0.01),0px_13px_8px_0px_rgba(0,0,0,0.05),0px_6px_6px_0px_rgba(0,0,0,0.09),0px_1px_3px_0px_rgba(0,0,0,0.1)]"
            >
              <header className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-poppins break-words text-[20px] font-normal leading-normal text-white">
                    {note.name}
                  </h3>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {isMyNote && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNote(note);
                          setShowForm(true);
                        }}
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
                        onClick={() => handleDeleteClick(note.id)}
                        disabled={deletingNoteId === note.id}
                        className="rounded p-1.5 text-white/70 transition-opacity hover:text-red-400 hover:opacity-100 disabled:opacity-50"
                        aria-label="Delete note"
                        title="Delete note"
                      >
                        {deletingNoteId === note.id ? (
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
              <div className="note-content font-poppins max-h-[192px] flex-1 overflow-hidden text-[20px] font-normal leading-[32px] text-white">
                {note.gratitudeItems
                  .slice(0, MAX_VISIBLE_LINES)
                  .map((item, idx) => (
                    <div key={idx} className="break-words">
                      {item}
                    </div>
                  ))}
                {note.gratitudeItems.length > MAX_VISIBLE_LINES && (
                  <p className="mt-auto text-right text-[12px] font-medium uppercase tracking-[0.2em] text-white/70">
                    +{note.gratitudeItems.length - MAX_VISIBLE_LINES} more...
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {!loading && notes.length === 0 && userHasNote && (
        <p className="font-poppins text-[20px] text-white">
          No gratitude shared yet today. Be the first!
        </p>
      )}

      {/* Form Modal - rendered via portal to cover entire screen */}
      {showForm &&
        createPortal(
          <>
            {/* Full screen blur overlay */}
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[5px]" />
            {/* Modal container */}
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowForm(false);
                }
              }}
            >
              <div
                className="h-[500px] w-[500px] overflow-hidden rounded-[16px] shadow-[0px_24px_60px_0px_rgba(0,0,0,0.25)]"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, rgba(42, 37, 88, 0.95) 0%, rgba(127, 88, 162, 1) 100%)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header with separation line */}
                <div className="flex h-[76px] items-center justify-between border-b border-[rgba(255,255,255,0.1)] px-8">
                  <h2 className="font-poppins text-[18px] font-normal leading-[27px] text-white">
                    {editingNote ? "Edit Gratitude Note" : "Add Gratitude Note"}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingNote(null);
                    }}
                    className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)] transition-colors hover:bg-[rgba(255,255,255,0.12)]"
                    aria-label="Close"
                  >
                    <svg
                      className="h-[14px] w-[14px]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                {/* Body */}
                <div className="h-[calc(500px-76px)] overflow-hidden">
                  <NoteFormCard
                    compact
                    editingNote={editingNote}
                    onSuccess={() => {
                      setShowForm(false);
                      setEditingNote(null);
                      // Reload notes to show the updated one
                      load();
                    }}
                  />
                </div>
              </div>
            </div>
          </>,
          document.body,
        )}

      {/* Delete Confirmation Modal */}
      {deletingNoteId &&
        createPortal(
          <>
            {/* Full screen blur overlay */}
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[5px]" />
            {/* Modal container */}
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  handleDeleteCancel();
                }
              }}
            >
              <div
                className="h-[234px] w-[500px] overflow-hidden rounded-[16px] bg-[rgba(11,4,29,0.8)] shadow-[0px_24px_60px_0px_rgba(0,0,0,0.25)]"
                style={{
                  backgroundImage:
                    "linear-gradient(154.92deg, rgba(42, 37, 88, 0.95) 0%, rgba(127, 88, 162, 1) 100%)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header with separation line */}
                <div className="flex h-[76px] items-center justify-between border-b border-[rgba(255,255,255,0.1)] px-8">
                  <h2 className="font-poppins text-[18px] font-normal leading-[27px] text-white">
                    Delete Note
                  </h2>
                  <button
                    type="button"
                    onClick={handleDeleteCancel}
                    className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)] transition-colors hover:bg-[rgba(255,255,255,0.12)]"
                    aria-label="Close"
                  >
                    <svg
                      className="h-[14px] w-[14px]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                {/* Body */}
                <div className="flex h-[calc(234px-76px)] flex-col gap-[13px] px-[24px] py-[18px]">
                  <p className="font-poppins text-center text-[18px] font-medium leading-[24px] text-white">
                    Are you sure you want to delete this note?
                  </p>
                  <div className="mt-auto flex gap-[20px]">
                    <button
                      type="button"
                      onClick={handleDeleteConfirm}
                      className="font-poppins h-[48px] flex-1 rounded-[16px] bg-[rgba(2,0,17,0.7)] text-[18px] font-medium text-white shadow-[0px_10px_30px_0px_rgba(0,0,0,0.25)] transition-all hover:bg-[rgba(2,0,17,0.85)]"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteCancel}
                      className="font-poppins h-[48px] flex-1 rounded-[16px] bg-[#3b3b3b] text-[18px] font-medium text-white shadow-[0px_10px_30px_0px_rgba(0,0,0,0.25)] transition-all hover:bg-[#565656]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>,
          document.body,
        )}
    </section>
  );
}

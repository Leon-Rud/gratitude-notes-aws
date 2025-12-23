import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { deleteNote, getTodayNotes } from "../../api/notes";
import type { GratitudeNote } from "../../api/types";
import { useAuth } from "../../contexts/AuthContext";
import { NoteSkeleton } from "./NoteSkeleton";
import { NoteFormCard } from "./NoteFormCard";

export const HOVER_COLORS = [
  "#1E1B4B",
  "#312E81",
  "#4C1D95",
  "#581C87",
  "#2D1B69",
  "#0D3B66",
  "#0C4A6E",
  "#004E64",
  "#134E4A",
  "#064E3B",
  "#7F1D1D",
  "#78350F",
  "#451A03",
  "#3D0C11",
  "#0F172A",
  "#111827",
];

// Get a consistent color for a note based on its ID
function getNoteHoverColor(noteId: string): string {
  let hash = 0;
  for (let i = 0; i < noteId.length; i++) {
    hash = noteId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % HOVER_COLORS.length;
  return HOVER_COLORS[index];
}

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
  // Check if user has a note in the loaded notes (by ID or email)
  const userHasNote = notes.some(
    (n) =>
      (userNoteId && n.id === userNoteId) ||
      (user?.email && n.email === user.email),
  );

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
      // First try to find by localStorage note ID
      const currentUserNoteId = localStorage.getItem("gratitude-user-note-id");
      let userNote: GratitudeNote | undefined;

      if (currentUserNoteId) {
        userNote = items.find((n) => n.id === currentUserNoteId);
      }

      // If not found by ID, try to find by user's email
      if (!userNote && user?.email) {
        userNote = items.find((n) => n.email === user.email);
        // If found by email, update localStorage for future reference
        if (userNote) {
          localStorage.setItem("gratitude-user-note-id", userNote.id);
        }
      }

      // Move user's note to the front if found
      if (userNote) {
        items = [userNote, ...items.filter((n) => n.id !== userNote!.id)];
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
          className={`relative h-[336px] w-[336px] overflow-hidden rounded-[16px] border-[1.5px] border-[rgba(255,255,255,0.3)] bg-[rgba(104,104,104,0.2)] shadow-[0px_36px_10px_0px_rgba(0,0,0,0),0px_23px_9px_0px_rgba(0,0,0,0.01),0px_13px_8px_0px_rgba(0,0,0,0.05),0px_6px_6px_0px_rgba(0,0,0,0.09),0px_1px_3px_0px_rgba(0,0,0,0.1)] backdrop-blur-[7.5px] ${
            addButtonDisabled
              ? "cursor-not-allowed opacity-60"
              : "transition-all hover:-translate-y-0.5"
          }`}
          style={{ mixBlendMode: "darken" }}
        >
          <p className="font-poppins absolute left-1/2 top-[24px] w-[282px] -translate-x-1/2 text-center text-[20px] font-normal leading-[1.2] text-white">
            {addButtonDisabled
              ? "One gratitude note a day 🌿"
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
          const isMyNote =
            (userNoteId && note.id === userNoteId) ||
            (user?.email && note.email === user.email);
          const hoverColor = getNoteHoverColor(note.id);

          return (
            <article
              key={note.id}
              className="flex h-[336px] w-[336px] flex-col overflow-hidden rounded-[16px] border-[1.5px] border-[rgba(255,255,255,0.3)] bg-[rgba(104,104,104,0.2)] p-6 shadow-[0px_36px_10px_0px_rgba(0,0,0,0),0px_23px_9px_0px_rgba(0,0,0,0.01),0px_13px_8px_0px_rgba(0,0,0,0.05),0px_6px_6px_0px_rgba(0,0,0,0.09),0px_1px_3px_0px_rgba(0,0,0,0.1)] backdrop-blur-[7.5px] transition-colors duration-200"
              style={{ mixBlendMode: "darken" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = hoverColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(104,104,104,0.2)";
              }}
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
                className="h-[179px] w-[500px] overflow-hidden rounded-[16px] shadow-[0px_24px_60px_0px_rgba(0,0,0,0.25)]"
                style={{
                  backgroundImage:
                    "linear-gradient(160.1deg, rgba(42, 37, 88, 0.95) 0%, rgba(127, 88, 162, 1) 100%)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header with separation line */}
                <div className="flex h-[75px] items-center border-b border-[rgba(255,255,255,0.1)] px-[36px]">
                  <p className="font-poppins text-[18px] font-normal leading-[27px] text-white">
                    Are you sure you want to delete this note?
                  </p>
                </div>
                {/* Body with buttons */}
                <div className="relative flex h-[104px] items-center justify-center px-[24px]">
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    className="font-poppins absolute left-[calc(50%-117px)] top-1/2 h-[48px] w-[214px] -translate-x-1/2 -translate-y-1/2 rounded-[50px] border-2 border-white bg-[rgba(255,255,255,0.1)] px-[20px] py-[10px] text-[18px] font-normal leading-normal text-white transition-all hover:bg-[rgba(255,255,255,0.15)]"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteCancel}
                    className="font-poppins absolute left-[calc(50%+117px)] top-1/2 h-[48px] w-[214px] -translate-x-1/2 -translate-y-1/2 rounded-[50px] border-2 border-white bg-black px-[20px] py-[10px] text-[18px] font-normal leading-normal text-white transition-all hover:opacity-90"
                    style={{
                      border: "2px solid white",
                      boxShadow: "inset 0 0 0 0.5px #d0d5dd",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </>,
          document.body,
        )}
    </section>
  );
}

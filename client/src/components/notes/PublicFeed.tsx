import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { deleteNote, getTodayNotes } from "../../api/notes";
import type { GratitudeNote } from "../../api/types";
import { useAuth } from "../../contexts/AuthContext";
import { NoteSkeleton } from "./NoteSkeleton";
import { NoteFormCard } from "./NoteFormCard";

export function PublicFeed() {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState<GratitudeNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  // Get user's note ID from localStorage (with backwards compatibility)
  const userNoteId = localStorage.getItem("gratitude-user-note-id");
  // Check if user has a note in the loaded notes
  const userHasNote = !!userNoteId && notes.some((n) => n.id === userNoteId);

  // Show empty note if: not loading, notes have been loaded, and user doesn't have a note
  const shouldShowEmptyNote = !loading && notes.length >= 0 && !userHasNote;

  async function load() {
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
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate a consistent color for each note based on its ID
  const getStickyNoteColor = (id: string) => {
    const colors = [
      {
        bg: "bg-yellow-200",
        text: "text-yellow-900",
        border: "border-yellow-300",
      },
      { bg: "bg-pink-200", text: "text-pink-900", border: "border-pink-300" },
      {
        bg: "bg-green-200",
        text: "text-green-900",
        border: "border-green-300",
      },
      { bg: "bg-blue-200", text: "text-blue-900", border: "border-blue-300" },
      {
        bg: "bg-purple-200",
        text: "text-purple-900",
        border: "border-purple-300",
      },
      {
        bg: "bg-orange-200",
        text: "text-orange-900",
        border: "border-orange-300",
      },
      { bg: "bg-cyan-200", text: "text-cyan-900", border: "border-cyan-300" },
      { bg: "bg-lime-200", text: "text-lime-900", border: "border-lime-300" },
    ];

    // Use note ID to consistently assign a color
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Generate a slight rotation for that authentic sticky note look
  const getRotation = (id: string): number => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Rotate between -3 and 3 degrees
    return (Math.abs(hash) % 7) - 3;
  };

  async function handleDelete(noteId: string) {
    if (!confirm("Are you sure you want to delete your gratitude note?")) {
      return;
    }

    // Deleting a note requires an owner token (backend enforces ?token=...).
    const token = localStorage.getItem(`gratitude-note-token-${noteId}`);

    if (!token) {
      setError(
        "Unable to delete: Please refresh the page and try again. If you created this note from a different device, check your email for the delete link.",
      );
      return;
    }

    setDeletingNoteId(noteId);
    try {
      await deleteNote(noteId, token);
      // Remove from localStorage
      localStorage.removeItem(`gratitude-note-${noteId}`);
      localStorage.removeItem(`gratitude-note-token-${noteId}`);
      // If this was the user's current note, clear it
      if (noteId === userNoteId) {
        localStorage.removeItem("gratitude-user-note-id");
      }
      // Reload notes
      load();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to delete note";
      setError(message);
    } finally {
      setDeletingNoteId(null);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-white">
        Today's Gratitude Notes
      </h2>
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {loading && notes.length === 0 && (
          <>
            <NoteSkeleton />
            <NoteSkeleton />
            <NoteSkeleton />
            <NoteSkeleton />
            <NoteSkeleton />
          </>
        )}
        {/* Empty note card if user doesn't have a note */}
        {shouldShowEmptyNote && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="aspect-square w-full rounded-sm border-2 border-dashed border-slate-500 bg-slate-700/30 p-4 shadow-lg transition-all hover:scale-105 hover:border-slate-400 hover:bg-slate-700/50"
            style={{
              transform: "rotate(-1deg)",
            }}
          >
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-300">
              <div className="mb-2 text-5xl font-light">+</div>
              <div className="text-sm font-medium">Add your gratitude note</div>
            </div>
          </button>
        )}
        {notes.map((note) => {
          const isMyNote = note.id === userNoteId;
          const colors = getStickyNoteColor(note.id);
          const rotation = getRotation(note.id);

          return (
            <article
              key={note.id}
              className={`aspect-square w-full rounded-sm border-2 p-4 shadow-lg transition-transform hover:scale-105 ${
                colors.bg
              } ${colors.border} ${colors.text}`}
              style={{
                transform: `rotate(${rotation}deg)`,
              }}
            >
              <header className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="break-words text-sm font-bold">{note.name}</h3>
                  {isMyNote && (
                    <span className="mt-1 inline-block rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-medium">
                      Your note
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {note.createdAt && (
                    <time
                      className="flex-shrink-0 text-[10px] opacity-70"
                      dateTime={note.createdAt}
                    >
                      {new Date(note.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  )}
                  {isMyNote && (
                    <button
                      type="button"
                      onClick={() => handleDelete(note.id)}
                      disabled={deletingNoteId === note.id}
                      className="flex-shrink-0 rounded p-1 text-slate-600 opacity-70 transition-opacity hover:text-red-600 hover:opacity-100 disabled:opacity-50"
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
                  )}
                </div>
              </header>
              <div className="space-y-1 overflow-hidden text-sm font-medium leading-relaxed">
                {note.gratitudeItems.map((item, idx) => (
                  <div key={idx} className="break-words">
                    {item}
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
      {!loading && notes.length === 0 && userHasNote && (
        <p className="text-sm text-slate-400">
          No gratitude shared yet today. Be the first!
        </p>
      )}

      {/* Form Modal - rendered via portal to cover entire screen */}
      {showForm &&
        createPortal(
          <>
            {/* Full screen blur overlay */}
            <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" />
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
                className="w-full max-w-2xl rounded-xl bg-slate-800 p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    Add your gratitude note
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-slate-400 hover:text-white"
                    aria-label="Close"
                  >
                    <svg
                      className="h-6 w-6"
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
                <NoteFormCard
                  compact
                  onSuccess={() => {
                    setShowForm(false);
                    // Reload notes to show the new one
                    load();
                  }}
                />
              </div>
            </div>
          </>,
          document.body,
        )}
    </section>
  );
}

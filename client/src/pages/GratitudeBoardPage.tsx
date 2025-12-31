import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { deleteNote, getTodayNotes } from "../api/notes";
import type { GratitudeNote } from "../api/types";
import { useAuth } from "../contexts/AuthContext";
import type { User } from "../contexts/AuthContext";
import { NoteSkeleton } from "../components/notes/NoteSkeleton";
import { NoteFormCard } from "../components/notes/NoteFormCard";
import { FeedbackButton } from "../components/feedback";
import { useScrollBlur } from "../hooks/useScrollBlur";

interface GratitudeBoardPageProps {
  user: User | null;
  logout: () => void;
  missingConfig: boolean;
  enableFeedback: boolean;
}

export function GratitudeBoardPage({
  user,
  logout,
  missingConfig,
  enableFeedback,
}: GratitudeBoardPageProps) {
  const { user: authUser } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Very subtle blur at start, clearer as you scroll down
  const { blurAmount } = useScrollBlur(scrollContainerRef, {
    initialBlur: 5,
    initialOpacity: 0.45,
    minOpacity: 0.45, // Keep color fixed
  });

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
      (authUser?.email && n.email === authUser.email),
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
      if (!userNote && authUser?.email) {
        userNote = items.find((n) => n.email === authUser.email);
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
    <div className="relative h-screen w-full max-w-[100vw] overflow-hidden">
      {/* Fixed Background with subtle progressive blur */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/assets/images/backgrounds/feed-background.png')",
          }}
          aria-hidden="true"
        />

        {/* Purple tint overlay - fixed opacity */}
        <div
          className="absolute inset-0 bg-[#5F52B2]/45"
          aria-hidden="true"
        />

        {/* Subtle blur - light at start, clearer as you scroll */}
        <div
          className="absolute inset-0 transition-[backdrop-filter] duration-150"
          style={{
            backdropFilter: `blur(${blurAmount}px)`,
            WebkitBackdropFilter: `blur(${blurAmount}px)`,
          }}
          aria-hidden="true"
        />
      </div>

      {/* Scrollable Content */}
      <div
        ref={scrollContainerRef}
        className="relative z-10 h-full w-full overflow-y-auto overflow-x-hidden"
      >
        {/* Header - Figma style */}
        <header className="flex items-center justify-between border-b border-white/[0.14] bg-[rgba(0,0,0,0.1)] px-8 py-4">
          {/* Left: Title */}
          <h1 className="font-manrope text-[24px] font-extrabold uppercase leading-[1.2] tracking-[2.88px] text-[#f1eeea]">
            Gratitude Board
          </h1>

          {/* Right: About us, Log out, Avatar */}
          <div className="flex h-[55px] w-[276px] items-center justify-between">
            {/* About us with glass pill background */}
            <a
              href="#/about"
              className="relative flex h-[36px] w-[110px] items-center justify-center rounded-[16px] bg-[rgba(255,255,255,0.1)] font-manrope text-[16px] font-semibold uppercase tracking-[1.76px] text-white transition-colors hover:bg-[rgba(255,255,255,0.15)]"
            >
              About us
            </a>

            {/* Log out */}
            <button
              onClick={logout}
              className="font-manrope text-[16px] font-semibold uppercase leading-[35px] tracking-[1.92px] text-white transition-opacity hover:opacity-80"
            >
              Log out
            </button>

            {/* User Avatar */}
            {user && (
              <div className="flex items-center rounded px-2">
                <div className="relative h-[55px] w-[55px]">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name || "User"}
                      className="h-full w-full rounded-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.startsWith("data:image/svg+xml")) {
                          target.src = `data:image/svg+xml,${encodeURIComponent(
                            `<svg xmlns="http://www.w3.org/2000/svg" width="55" height="55" viewBox="0 0 55 55">
                              <circle cx="27.5" cy="27.5" r="27.5" fill="rgba(255,255,255,0.2)"/>
                              <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="white" font-size="22" font-family="Arial, sans-serif" font-weight="600">${(user.name || "U").charAt(0).toUpperCase()}</text>
                            </svg>`,
                          )}`;
                        }
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-[rgba(255,255,255,0.2)]">
                      <span className="font-poppins text-xl font-semibold text-white">
                        {(user.name || "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {missingConfig && (
          <div className="mx-8 mt-4 rounded-lg border border-amber-500/60 bg-amber-500/10 p-4 text-sm text-amber-100">
            <p className="font-semibold">Environment not configured</p>
            <p className="mt-1">
              Set <code className="font-mono">VITE_API_BASE_URL</code> in a{" "}
              <code className="font-mono">.env.local</code> file.
            </p>
          </div>
        )}

        {/* Main Content Area */}
        <main className="px-[37px] pt-[26px]">
          {/* Error Banner */}
          {error && (
            <div className="mb-4 rounded-lg border border-rose-500/60 bg-rose-500/10 p-4 text-sm text-rose-100">
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

          {/* Notes Grid */}
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

            {/* Add Note Button Card */}
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
              <p className="absolute left-1/2 top-[24px] w-[282px] -translate-x-1/2 text-center font-poppins text-[20px] font-normal leading-[1.2] text-white">
                {addButtonDisabled
                  ? "One gratitude note a day"
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

            {/* Empty-state dashed placeholder box */}
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
                <p className="absolute left-1/2 top-1/2 w-[282px] -translate-x-1/2 -translate-y-1/2 text-center font-poppins text-[20px] font-normal leading-[1.2] text-white">
                  You&apos;ll see everyone&apos;s notes here once people start
                  sharing.
                </p>
              </div>
            )}

            {/* Note Cards */}
            {notes.map((note) => {
              const isMyNote =
                (userNoteId && note.id === userNoteId) ||
                (authUser?.email && note.email === authUser.email);

              return (
                <article
                  key={note.id}
                  className="flex h-[336px] w-[336px] flex-col overflow-hidden rounded-[16px] border-[1.5px] border-[rgba(255,255,255,0.3)] bg-[rgba(104,104,104,0.2)] p-6 shadow-[0px_36px_10px_0px_rgba(0,0,0,0),0px_23px_9px_0px_rgba(0,0,0,0.01),0px_13px_8px_0px_rgba(0,0,0,0.05),0px_6px_6px_0px_rgba(0,0,0,0.09),0px_1px_3px_0px_rgba(0,0,0,0.1)] backdrop-blur-[7.5px]"
                  style={{ mixBlendMode: "darken" }}
                >
                  <header className="mb-3 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-poppins text-[20px] font-normal leading-normal text-white">
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
                  <div className="note-content max-h-[192px] flex-1 overflow-hidden whitespace-pre-wrap break-words font-poppins text-[20px] font-normal leading-[32px] text-white">
                    {(() => {
                      const lines = note.gratitudeText.split("\n");
                      const visibleLines = lines.slice(0, MAX_VISIBLE_LINES);
                      const remainingLines = lines.length - MAX_VISIBLE_LINES;
                      return (
                        <>
                          {visibleLines.join("\n")}
                          {remainingLines > 0 && (
                            <p className="mt-auto text-right text-[12px] font-medium uppercase tracking-[0.2em] text-white/70">
                              +{remainingLines} more...
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </article>
              );
            })}
          </div>

          {!loading && notes.length === 0 && userHasNote && (
            <p className="mt-4 font-poppins text-[20px] text-white">
              No gratitude shared yet today. Be the first!
            </p>
          )}

          {/* Did you know section - positioned near bottom of viewport, cards below fold */}
          <section className="mt-[400px] pb-[60px]">
            <h2 className="mb-[75px] text-center font-manrope text-[24px] font-semibold leading-[1.2] text-white">
              Did you know that daily gratitude practice:
            </h2>

            {/* Facts boxes - 2x2 grid layout */}
            <div className="mx-auto grid max-w-[1124px] grid-cols-1 gap-x-[32px] gap-y-[24px] md:grid-cols-2">
              {/* Row 1 */}
              <div className="flex h-[82px] items-center justify-center rounded-[50px] bg-[rgba(104,104,104,0.2)] p-[10px] backdrop-blur-[7.5px]">
                <p className="px-5 py-2.5 text-center font-manrope text-[24px] font-normal leading-[1.2] tracking-[2.4px] text-white">
                  Lower Burnout rates by 20%
                </p>
              </div>
              <div className="flex h-[82px] items-center justify-center rounded-[50px] bg-[rgba(104,104,104,0.2)] p-[10px] backdrop-blur-[7.5px]">
                <p className="px-5 py-2.5 text-center font-manrope text-[24px] font-normal leading-[1.2] tracking-[2.4px] text-white">
                  Enhance mental strength
                </p>
              </div>

              {/* Row 2 */}
              <div className="flex h-[82px] items-center justify-center rounded-[50px] bg-[rgba(104,104,104,0.2)] p-[10px] backdrop-blur-[7.5px]">
                <p className="px-5 py-2.5 text-center font-manrope text-[24px] font-normal leading-[1.2] tracking-[2.4px] text-white">
                  Reduce depression and anxiety
                </p>
              </div>
              <div className="flex h-[82px] items-center justify-center rounded-[50px] bg-[rgba(104,104,104,0.2)] p-[10px] backdrop-blur-[7.5px]">
                <p className="px-5 py-2.5 text-center font-manrope text-[24px] font-normal leading-[1.2] tracking-[2.4px] text-white">
                  <span className="block">Improves Sleep Quality</span>
                  <span className="block">by 75%</span>
                </p>
              </div>
            </div>
          </section>

          <footer className="py-6 text-center text-xs text-white/50">
            © 2025 Daily Gratitude Notes
          </footer>
        </main>

        {enableFeedback && <FeedbackButton />}
      </div>

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
                    className="absolute left-[calc(50%-117px)] top-1/2 h-[48px] w-[214px] -translate-x-1/2 -translate-y-1/2 rounded-[50px] border-2 border-white bg-[rgba(255,255,255,0.1)] px-[20px] py-[10px] font-poppins text-[18px] font-normal leading-normal text-white transition-all hover:bg-[rgba(255,255,255,0.15)]"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteCancel}
                    className="absolute left-[calc(50%+117px)] top-1/2 h-[48px] w-[214px] -translate-x-1/2 -translate-y-1/2 rounded-[50px] border-2 border-white bg-black px-[20px] py-[10px] font-poppins text-[18px] font-normal leading-normal text-white transition-all hover:opacity-90"
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
    </div>
  );
}

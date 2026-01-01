import { useEffect, useRef, useState } from "react";
import { deleteNote, getTodayNotes } from "../api/notes";
import type { GratitudeNote } from "../api/types";
import { useAuth } from "../contexts/AuthContext";
import type { User } from "../contexts/AuthContext";
import { useScrollBlur } from "../hooks/useScrollBlur";
import { Modal, ModalHeader } from "../components/ui";
import {
  GratitudeBoardHeader,
  NoteCard,
  DeleteConfirmationModal,
  DidYouKnowSection,
  NoteFormCard,
  NoteSkeleton,
  FeedbackButton,
} from "../components/board";

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
  const { blurAmount } = useScrollBlur(scrollContainerRef, {
    initialBlur: 5,
    initialOpacity: 0.45,
    minOpacity: 0.45,
  });

  const [notes, setNotes] = useState<GratitudeNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<GratitudeNote | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const isLoadingRef = useRef(false);

  const userNoteId = localStorage.getItem("gratitude-user-note-id");
  const userHasNote = notes.some(
    (n) =>
      (userNoteId && n.id === userNoteId) ||
      (authUser?.email && n.email === authUser.email),
  );
  const shouldShowEmptyNote = !loading && notes.length >= 0 && !userHasNote;
  const addButtonDisabled = userHasNote;

  async function load() {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    try {
      setLoading(true);
      setError(null);
      const res = await getTodayNotes();
      let items = res.items;

      const currentUserNoteId = localStorage.getItem("gratitude-user-note-id");
      let userNote: GratitudeNote | undefined;

      if (currentUserNoteId) {
        userNote = items.find((n) => n.id === currentUserNoteId);
      }

      if (!userNote && authUser?.email) {
        userNote = items.find((n) => n.email === authUser.email);
        if (userNote) {
          localStorage.setItem("gratitude-user-note-id", userNote.id);
        }
      }

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

  function handleEditNote(note: GratitudeNote) {
    setEditingNote(note);
    setShowForm(true);
  }

  function handleDeleteClick(noteId: string) {
    setDeletingNoteId(noteId);
  }

  async function handleDeleteConfirm() {
    if (!deletingNoteId) return;

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
    setDeleteLoading(true);
    try {
      await deleteNote(noteIdToDelete, token);
      localStorage.removeItem(`gratitude-note-${noteIdToDelete}`);
      localStorage.removeItem(`gratitude-note-token-${noteIdToDelete}`);
      if (noteIdToDelete === userNoteId) {
        localStorage.removeItem("gratitude-user-note-id");
      }
      setDeletingNoteId(null);
      load();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to delete note";
      setError(message);
      setDeletingNoteId(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="relative h-screen w-full max-w-[100vw] overflow-hidden">
      {/* Fixed Background with subtle progressive blur */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/assets/images/backgrounds/feed-background.png')",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[#5F52B2]/45"
          aria-hidden="true"
        />
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
        <GratitudeBoardHeader user={user} logout={logout} />

        {missingConfig && (
          <div className="mx-8 mt-4 rounded-lg border border-amber-500/60 bg-amber-500/10 p-4 text-sm text-amber-100">
            <p className="font-semibold">Environment not configured</p>
            <p className="mt-1">
              Set <code className="font-mono">VITE_API_BASE_URL</code> in a{" "}
              <code className="font-mono">.env.local</code> file.
            </p>
          </div>
        )}

        <main className="px-[36px] pt-[64px]">
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
          <div className="grid grid-cols-[repeat(auto-fill,336px)] justify-start gap-x-[32px] gap-y-[32px]">
            {loading && notes.length === 0 && (
              // TODO: Replace with same style loading
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
              className={`relative h-[336px] w-[336px] overflow-hidden rounded-card border-[1.5px] border-transparent bg-[rgba(95,82,178,0.35)] shadow-[0px_36px_10px_0px_rgba(0,0,0,0),0px_23px_9px_0px_rgba(0,0,0,0.01),0px_13px_8px_0px_rgba(0,0,0,0.05),0px_6px_6px_0px_rgba(0,0,0,0.09),0px_1px_3px_0px_rgba(0,0,0,0.1)] backdrop-blur-glass ${
                addButtonDisabled
                  ? "cursor-not-allowed opacity-60"
                  : "transition-all hover:-translate-y-0.5"
              }`}
            >
              <p className="absolute left-1/2 top-[24px] w-[282px] -translate-x-1/2 text-center font-poppins text-[20px] font-normal leading-[1.2] text-white">
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

            {/* Empty-state dashed placeholder box */}
            {shouldShowEmptyNote && notes.length === 0 && !loading && (
              <div className="relative h-[336px] w-[336px] overflow-hidden rounded-card">
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
                <p className="absolute left-1/2 top-[40px] w-[282px] -translate-x-1/2 text-center font-poppins text-[20px] font-normal leading-[1.2] text-white">
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
                <NoteCard
                  key={note.id}
                  note={note}
                  isMyNote={!!isMyNote}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteClick}
                  isDeleting={deletingNoteId === note.id}
                />
              );
            })}
          </div>

          {!loading && notes.length === 0 && userHasNote && (
            <p className="mt-4 font-poppins text-[20px] text-white">
              No gratitude shared yet today. Be the first!
            </p>
          )}

          <DidYouKnowSection />

          <footer className="py-6 text-center text-xs text-white/50">
            © 2025 Daily Gratitude Notes
          </footer>
        </main>

        {enableFeedback && <FeedbackButton />}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingNote(null);
        }}
        className="h-[450px] w-[500px] overflow-hidden rounded-card shadow-[0_0_20px_rgba(169,109,206,0.4),0px_24px_60px_0px_rgba(0,0,0,0.25)]"
      >
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(42, 37, 88, 0.95) 0%, rgba(127, 88, 162, 1) 100%)",
          }}
        >
          <ModalHeader
            title={editingNote ? "Edit Gratitude Note" : "Add Gratitude Note"}
            onClose={() => {
              setShowForm(false);
              setEditingNote(null);
            }}
          />
          <div className="h-[370px] overflow-hidden">
            <NoteFormCard
              compact
              editingNote={editingNote}
              onSuccess={() => {
                setShowForm(false);
                setEditingNote(null);
                load();
              }}
            />
          </div>
        </div>
      </Modal>

      <DeleteConfirmationModal
        isOpen={!!deletingNoteId}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingNoteId(null)}
        isLoading={deleteLoading}
      />
    </div>
  );
}

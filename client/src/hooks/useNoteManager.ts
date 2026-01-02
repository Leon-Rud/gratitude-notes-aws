import { useEffect, useRef, useState } from "react";
import { deleteNote, getTodayNotes } from "../api/notes";
import type { GratitudeNote } from "../api/types";
import { useAuth } from "../contexts/AuthContext";

export function useNoteManager() {
  const { user: authUser } = useAuth();
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

  return {
    notes,
    loading,
    error,
    setError,
    showForm,
    setShowForm,
    editingNote,
    setEditingNote,
    deletingNoteId,
    setDeletingNoteId,
    deleteLoading,
    userHasNote,
    shouldShowEmptyNote,
    addButtonDisabled,
    userNoteId,
    load,
    handleEditNote,
    handleDeleteClick,
    handleDeleteConfirm,
  };
}

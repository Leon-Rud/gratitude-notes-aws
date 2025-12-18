import { useEffect, useState } from "react";
import { getNote } from "../../api/notes";
import type { GratitudeNote } from "../../api/types";
import { NoteSkeleton } from "./NoteSkeleton";

interface NoteDetailProps {
  id: string;
}

export function NoteDetail({ id }: NoteDetailProps) {
  const [note, setNote] = useState<GratitudeNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Check if token is in URL (from email link)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      localStorage.setItem(`gratitude-note-token-${id}`, token);
      // Clean up URL
      window.history.replaceState(
        {},
        "",
        window.location.pathname + window.location.hash,
      );
    }

    (async () => {
      try {
        setLoading(true);
        const data = await getNote(id);
        if (isMounted) setNote(data);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load";
        setError(message);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) return <NoteSkeleton />;
  if (error) {
    return (
      <div className="rounded-lg border border-rose-500/60 bg-rose-500/10 p-4 text-sm text-rose-100">
        <p className="font-semibold">Failed to load note</p>
        <p className="mt-1">{error}</p>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setLoading(true);
            getNote(id)
              .then((data) => setNote(data))
              .catch((e) =>
                setError(e instanceof Error ? e.message : "Failed to load"),
              )
              .finally(() => setLoading(false));
          }}
          className="mt-3 rounded-md bg-rose-500/20 px-3 py-1.5 text-xs font-medium hover:bg-rose-500/30"
        >
          Retry
        </button>
      </div>
    );
  }
  if (!note) return null;

  return (
    <article className="rounded-xl bg-slate-800/80 p-4 ring-1 ring-slate-700">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-white">{note.name}</h3>
          {note.createdAt && (
            <time
              className="block text-xs text-slate-400"
              dateTime={note.createdAt}
            >
              {new Date(note.createdAt).toLocaleString()}
            </time>
          )}
        </div>
      </header>

      <div className="mt-2 space-y-1 text-slate-200">
        {note.gratitudeItems.map((item, idx) => (
          <div key={idx}>{item}</div>
        ))}
      </div>
    </article>
  );
}

import { useState } from "react";
import { StatusBanner, StatusState } from "../StatusBanner";
import { useAuth } from "../../contexts/AuthContext";
import { createGratitudeNote, parseGratitudeText } from "../../api/notes";

type NoteFormCardProps = {
  onSuccess?: () => void;
  compact?: boolean; // If true, removes outer section wrapper for modal use
};

export function NoteFormCard({
  onSuccess,
  compact = false,
}: NoteFormCardProps = {}) {
  const { user } = useAuth();
  const [gratitudeText, setGratitudeText] = useState("");

  const [status, setStatus] = useState<StatusState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function handleGratitudeChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    const wasEmpty = gratitudeText.trim() === "";

    // Auto-add bullet to first line only when user starts typing (field was empty)
    if (wasEmpty && value && !value.includes("\n")) {
      const trimmed = value.trim();
      if (trimmed && !trimmed.match(/^[-•*]\s/)) {
        setGratitudeText(`• ${trimmed}`);
        // Adjust cursor position
        setTimeout(() => {
          e.target.setSelectionRange(trimmed.length + 2, trimmed.length + 2);
        }, 0);
        return;
      }
    }

    // Check if user is typing on a new empty line (after a newline)
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const lines = textBeforeCursor.split("\n");
    const currentLine = lines[lines.length - 1];

    // If current line is empty (just whitespace) and user starts typing, add bullet
    if (currentLine.trim() === "" && value.length > gratitudeText.length) {
      // User just typed something on an empty line
      const textAfterCursor = value.substring(cursorPos);
      const newValue = textBeforeCursor + "• " + textAfterCursor;
      setGratitudeText(newValue);
      setTimeout(() => {
        e.target.setSelectionRange(cursorPos + 2, cursorPos + 2);
      }, 0);
      return;
    }

    setGratitudeText(value);
  }

  function handleGratitudeKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const value = textarea.value;
      const cursorPos = textarea.selectionStart;

      // Get the current line
      const textBeforeCursor = value.substring(0, cursorPos);
      const textAfterCursor = value.substring(cursorPos);

      // Always add bullet to new line
      const newValue = textBeforeCursor + "\n• " + textAfterCursor;
      setGratitudeText(newValue);

      // Set cursor position after the bullet
      setTimeout(() => {
        const newCursorPos = cursorPos + 3; // "\n• " = 3 characters
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  }

  function validate(): string | null {
    if (!user?.name || !user?.email) return "Please sign in to continue";
    const items = parseGratitudeText(gratitudeText);
    if (items.length === 0) return "Add at least one gratitude item";
    return null;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    const error = validate();
    if (error) {
      setStatus({ kind: "error", title: "Invalid input", message: error });
      return;
    }
    setIsLoading(true);
    try {
      if (!user?.name || !user?.email) {
        throw new Error("Not signed in.");
      }
      const result = await createGratitudeNote({
        name: user.name.trim(),
        email: user.email.trim(),
        gratitudeText,
      });
      // After creating note:
      localStorage.setItem(`gratitude-note-${result.id}`, "owner");
      localStorage.setItem(
        "gratitude-user-email",
        user.email.trim().toLowerCase(),
      );
      localStorage.setItem("gratitude-user-note-id", result.id);
      localStorage.setItem(
        `gratitude-note-token-${result.id}`,
        result.owner_token,
      );

      // Clear form
      setGratitudeText("");

      // Call success callback if provided
      onSuccess?.();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Request failed";
      setStatus({ kind: "error", title: "Submission failed", message });
      setIsLoading(false);
    }
  }

  const content = (
    <>
      <StatusBanner status={status} onClear={setStatus} />
      <div
        className={
          compact
            ? "flex h-full flex-col"
            : "flex h-full flex-col rounded-xl bg-slate-800/80 p-6 shadow-lg ring-1 ring-slate-700"
        }
      >
        <form
          className="flex flex-1 flex-col gap-4"
          onSubmit={onSubmit}
          aria-busy={isLoading}
        >
          <div className="flex flex-1 flex-col gap-4">
            {user && (
              <div className="rounded-lg bg-slate-700/50 p-3 text-sm">
                <p className="text-slate-300">
                  Signed in as{" "}
                  <span className="font-semibold text-white">{user.name}</span>
                  {user.email && (
                    <span className="text-slate-400"> ({user.email})</span>
                  )}
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="gratitude"
                className="block text-sm font-medium text-slate-200"
              >
                Gratitude items
              </label>
              <textarea
                id="gratitude"
                rows={6}
                value={gratitudeText}
                onChange={handleGratitudeChange}
                onKeyDown={handleGratitudeKeyDown}
                className="field min-h-[120px]"
                placeholder={`Example:\n• Morning coffee ritual\n• Supportive teammate\n• A quiet walk at lunch`}
                disabled={isLoading}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            aria-disabled={isLoading}
            className="mt-auto inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Working…" : "Share gratitude"}
          </button>
        </form>
      </div>
    </>
  );

  if (compact) {
    return content;
  }

  return <section className="space-y-4">{content}</section>;
}

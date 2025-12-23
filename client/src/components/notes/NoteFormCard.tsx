import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { createGratitudeNote, parseGratitudeText } from "../../api/notes";
import type { GratitudeNote } from "../../api/types";

type NoteFormCardProps = {
  onSuccess?: () => void;
  compact?: boolean; // If true, removes outer section wrapper for modal use
  editingNote?: GratitudeNote | null; // If provided, form is in edit mode
};

export function NoteFormCard({
  onSuccess,
  compact = false,
  editingNote = null,
}: NoteFormCardProps = {}) {
  const { user } = useAuth();
  const [gratitudeText, setGratitudeText] = useState("");

  // Pre-fill form when editing
  useEffect(() => {
    if (editingNote) {
      // Join gratitude items with newlines for editing
      setGratitudeText(editingNote.gratitudeItems.join("\n"));
    } else {
      setGratitudeText("");
    }
  }, [editingNote]);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const MAX_LENGTH = 200;
  const MAX_LINES = 6;

  function enforceMaxLines(value: string) {
    const lines = value.split("\n");
    if (lines.length <= MAX_LINES) return value;
    return lines.slice(0, MAX_LINES).join("\n");
  }

  function handleGratitudeChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newValue = e.target.value;
    // Enforce max length
    const limitedValue = enforceMaxLines(newValue);
    if (limitedValue.length <= MAX_LENGTH) {
      setGratitudeText(limitedValue);
      // Clear error state when user starts typing
      if (error) {
        setError(null);
      }
    }
  }

  function validate(): string | null {
    if (!user?.name || !user?.email) return "Please sign in to continue";
    if (gratitudeText.trim().length === 0) return "Please write a few words.";
    if (gratitudeText.length > MAX_LENGTH)
      return `Note must be ${MAX_LENGTH} characters or less.`;
    const items = parseGratitudeText(gratitudeText);
    if (items.length === 0) return "Add at least one gratitude item";
    return null;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
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
      // Show inline error for backend errors too
      const message = e instanceof Error ? e.message : "Request failed";
      setError(message);
      setIsLoading(false);
    }
  }

  const content = (
    <>
      <div
        className={
          compact
            ? "flex h-full flex-col px-[24px] pb-[20px] pt-[24px]"
            : "flex h-full flex-col rounded-[6px] border border-[rgba(255,255,255,0.12)] bg-[#2a2558] px-[24px] pb-[20px] pt-[24px] shadow-[0px_36px_10px_0px_rgba(0,0,0,0),0px_23px_9px_0px_rgba(0,0,0,0.01),0px_13px_8px_0px_rgba(0,0,0,0.05),0px_6px_6px_0px_rgba(0,0,0,0.09),0px_1px_3px_0px_rgba(0,0,0,0.1)]"
        }
      >
        <form
          className="relative flex flex-col gap-[13px]"
          onSubmit={onSubmit}
          aria-busy={isLoading}
        >
          <div className="relative flex flex-col">
            <div className="relative">
              <textarea
                id="gratitude"
                rows={6}
                value={gratitudeText}
                onChange={handleGratitudeChange}
                maxLength={MAX_LENGTH}
                className={`gratitude-textarea font-poppins h-[240px] w-full resize-none overflow-y-auto rounded-[8px] border bg-[#524974] py-[18px] pl-[18px] pr-[21px] text-[20px] font-normal leading-[1.2] text-white placeholder:text-white/70 focus:outline-none focus:ring-0 disabled:opacity-50 ${
                  error
                    ? "border-[#eb4cd8]"
                    : "border border-[rgba(255,255,255,0.2)]"
                }`}
                placeholder="What are you grateful for today?"
                disabled={isLoading}
              />
              <span
                className={`font-poppins absolute bottom-[18px] right-[21px] whitespace-nowrap text-[16px] font-normal leading-[26px] opacity-80 ${
                  gratitudeText.length > MAX_LENGTH
                    ? "text-[#eb4cd8]"
                    : "text-[rgba(255,255,255,0.8)]"
                }`}
              >
                {gratitudeText.length}/{MAX_LENGTH}
              </span>
            </div>
          </div>
          {error && (
            <p className="font-poppins absolute left-0 top-[calc(240px+13px)] text-[14px] font-normal leading-[21px] text-[#eb4cd8]">
              {error}
            </p>
          )}
          <div className="mt-[20px] flex justify-center">
            <button
              type="submit"
              disabled={isLoading}
              aria-disabled={isLoading}
              className="font-poppins h-[48px] w-[450px] rounded-[16px] bg-[rgba(2,0,17,0.7)] text-[18px] font-medium text-white shadow-[0px_10px_30px_0px_rgba(0,0,0,0.25)] transition-all hover:bg-[rgba(2,0,17,0.85)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading
                ? "Sharing gratitude ✨"
                : editingNote
                  ? "Update gratitude ✨"
                  : "Share gratitude ✨"}
            </button>
          </div>
        </form>
      </div>
    </>
  );

  if (compact) {
    return content;
  }

  return <section className="space-y-4">{content}</section>;
}

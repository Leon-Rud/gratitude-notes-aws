import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { createGratitudeNote } from "../../api/notes";
import type { GratitudeNote } from "../../api/types";
import { Textarea } from "../ui";
import { CARD_SHADOW } from "../../lib/constants";

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
      setGratitudeText(editingNote.gratitudeText);
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
    if (gratitudeText.length > MAX_LENGTH)
      return `Note must be ${MAX_LENGTH} characters or less.`;
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
        id: editingNote?.id,
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
            ? "flex h-full flex-col px-[24px] pb-[24px] pt-[12px]"
            : `flex h-full flex-col rounded-[6px] border border-ui-glassBorder bg-ui-formBackground px-[24px] pb-[24px] pt-[12px] ${CARD_SHADOW}`
        }
      >
        <form
          className="relative flex flex-col gap-[24px]"
          onSubmit={onSubmit}
          aria-busy={isLoading}
        >
          <div className="relative flex flex-col gap-[8px]">
            <span className="font-poppins text-[14px] font-normal leading-[21px] text-[rgba(255,255,255,0.7)]">
              You can add one note each day.
            </span>
            <div className="relative">
              <Textarea
                id="gratitude"
                rows={6}
                value={gratitudeText}
                onChange={handleGratitudeChange}
                maxLength={MAX_LENGTH}
                variant="default"
                error={!!error}
                className={`gratitude-textarea font-poppins h-[258px] w-[448px] overflow-y-auto rounded-input bg-ui-inputSubtle py-[18px] pl-[18px] pr-[21px] text-[20px] font-normal leading-[1.2] ${
                  error
                    ? "border-ui-accentPink"
                    : "border border-ui-inputBorder"
                }`}
                placeholder="What are you grateful for today?"
                disabled={isLoading}
              />
              <span
                className={`font-poppins absolute bottom-[8px] right-[18px] whitespace-nowrap text-[16px] font-normal leading-[26px] opacity-80 ${
                  gratitudeText.length > MAX_LENGTH
                    ? "text-ui-accentPink"
                    : "text-[rgba(255,255,255,0.8)]"
                }`}
              >
                {gratitudeText.length}/{MAX_LENGTH}
              </span>
            </div>
          </div>
          {/* Submit button - disabled when empty */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isLoading || gratitudeText.trim().length === 0}
              aria-disabled={isLoading || gratitudeText.trim().length === 0}
              className="flex h-[48px] w-[450px] items-center justify-center rounded-pill bg-ui-overlay px-[20px] py-[10px] font-poppins text-[18px] font-normal tracking-[-0.27px] text-white transition-all hover:bg-ui-overlayHover disabled:cursor-not-allowed disabled:opacity-50"
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

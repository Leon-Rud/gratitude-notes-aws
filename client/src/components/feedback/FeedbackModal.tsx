import { createPortal } from "react-dom";
import { Textarea, Typography } from "../ui";

type EmojiOption = {
  value: number;
  emoji: string;
};

type FeedbackModalProps = {
  isOpen: boolean;
  feedback: string;
  rating: number | null;
  submitted: boolean;
  error: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (formattedFeedback: string) => void;
  onFeedbackChange: (value: string) => void;
  onRatingChange: (rating: number | null) => void;
};

const emojis: EmojiOption[] = [
  { value: 0, emoji: "☹️" },
  { value: 1, emoji: "😔" },
  { value: 2, emoji: "😐" },
  { value: 3, emoji: "🙂" },
  { value: 4, emoji: "😊" },
];

export function FeedbackModal({
  isOpen,
  onClose,
  feedback,
  rating,
  submitted,
  error,
  isSubmitting,
  onSubmit,
  onFeedbackChange,
  onRatingChange,
}: FeedbackModalProps) {
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Format feedback with emoji if rating is provided
    let formattedFeedback = feedback;
    if (rating !== null) {
      const selectedEmoji = emojis.find((e) => e.value === rating);
      if (selectedEmoji) {
        formattedFeedback = `rating emoji: ${selectedEmoji.emoji}\nfeedback: ${feedback}`;
      }
    }
    onSubmit(formattedFeedback);
  };

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <>
      {/* Transparent overlay for click-outside-to-close */}
      <div className="fixed inset-0 z-40 bg-transparent" onClick={onClose} />

      {/* Modal */}
      <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-end p-4 pb-[100px] pr-[24px]">
        <div
          className="pointer-events-auto h-[500px] w-[500px] overflow-hidden rounded-[16px] shadow-[0px_24px_60px_0px_rgba(0,0,0,0.25)]"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(42, 37, 88, 0.95) 0%, rgba(169, 109, 206, 0.9) 100%)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex h-[80px] items-center justify-between border-b-[1.5px] border-[rgba(255,255,255,0.1)] px-[19px] py-[18px]">
            <h3 className="font-poppins text-[20px] font-normal leading-[27px] text-white">
              Feedback
            </h3>
            <button
              onClick={onClose}
              className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)] text-white transition-colors hover:bg-[rgba(255,255,255,0.12)]"
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
          <div className="flex h-[calc(500px-80px)] flex-col overflow-hidden px-[25px] pb-[25px] pt-[18px]">
            {submitted ? (
              <div className="flex h-full flex-col items-center justify-center px-2 text-center">
                <p className="font-poppins text-[18px] font-medium text-white">
                  ✓ Thank you!
                </p>
                <p className="mt-2 font-poppins text-sm text-white/70">
                  Your feedback has been emailed to the developer.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleFeedbackSubmit}
                className="flex h-full flex-col gap-[18px]"
              >
                {/* Rating Section */}
                <div className="flex flex-col gap-[5px]">
                  <p className="font-poppins text-[20px] font-light leading-normal text-white">
                    How was your experience?
                  </p>
                  <div className="flex items-center justify-start gap-[10px]">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji.value}
                        type="button"
                        onClick={() => onRatingChange(emoji.value)}
                        className={`flex h-[50px] w-[50px] items-center justify-center rounded-full text-[40px] transition-all duration-200 ${
                          rating === emoji.value
                            ? "scale-110 opacity-100"
                            : "opacity-50 hover:scale-110 hover:opacity-100"
                        }`}
                        aria-label={`Rate ${emoji.emoji}`}
                      >
                        {emoji.emoji}
                      </button>
                    ))}
                  </div>
                  <p className="font-poppins text-[16px] font-light italic leading-normal text-[#ddd]"></p>
                </div>

                {/* Feedback Textarea */}
                <div className="flex flex-1 flex-col">
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(event) => onFeedbackChange(event.target.value)}
                    placeholder="Suggest anything we can improve.."
                    variant="subtle"
                    className="flex-1 px-[15px] py-[13px] font-poppins text-[16px] font-normal leading-normal shadow-[0px_1px_5px_0px_rgba(0,0,0,0.2)]"
                    required
                    disabled={isSubmitting}
                  />
                  {error && (
                    <Typography
                      variant="caption"
                      as="p"
                      className="mt-2 leading-[21px] text-error"
                    >
                      {error}
                    </Typography>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !feedback.trim()}
                  className="group relative flex h-[48px] w-full items-center justify-center gap-3 rounded-[50px] bg-[rgba(0,0,0,0.75)] px-[20px] py-[10px] font-poppins text-[18px] font-normal leading-normal tracking-[-0.27px] text-white backdrop-blur-[7.5px] transition-all hover:bg-[rgba(255,255,255,0.1)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>{isSubmitting ? "Sending..." : "Share Feedback"}</span>
                  {!isSubmitting && (
                    <div className="h-[25px] w-[25px] opacity-50 transition-opacity group-hover:opacity-100">
                      <svg
                        className="h-full w-full"
                        viewBox="0 0 25 25"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.5 2L14.3 8.7L21 10.5L14.3 12.3L12.5 19L10.7 12.3L4 10.5L10.7 8.7L12.5 2Z"
                          fill="white"
                        />
                        <path
                          d="M12.5 6L13.5 9.5L17 10.5L13.5 11.5L12.5 15L11.5 11.5L8 10.5L11.5 9.5L12.5 6Z"
                          fill="white"
                          fillOpacity="0.5"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

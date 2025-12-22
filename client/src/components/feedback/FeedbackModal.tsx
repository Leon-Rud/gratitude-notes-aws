import type { FormEvent } from "react";

type FeedbackModalProps = {
  isOpen: boolean;
  feedback: string;
  submitted: boolean;
  error: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFeedbackChange: (value: string) => void;
};

export function FeedbackModal({
  isOpen,
  onClose,
  feedback,
  submitted,
  error,
  isSubmitting,
  onSubmit,
  onFeedbackChange,
}: FeedbackModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[5px]"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="h-[420px] w-[500px] overflow-hidden rounded-[16px] shadow-[0px_24px_60px_0px_rgba(0,0,0,0.25)]"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(42, 37, 88, 0.95) 0%, rgba(127, 88, 162, 1) 100%)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex h-[76px] items-center justify-between border-b border-[rgba(255,255,255,0.1)] px-8">
            <h3 className="font-poppins text-[18px] font-normal leading-[27px] text-white">
              Share Your Feedback
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

          <div className="flex h-[calc(420px-76px)]  flex-col overflow-hidden p-[24px]">
            {submitted ? (
              <div className="flex h-full flex-col items-center justify-center px-2 text-center">
                <p className="font-poppins text-[18px] font-medium text-white">
                  ✓ Thank you!
                </p>
                <p className="font-poppins mt-2 text-sm text-white/70">
                  Your feedback has been emailed to the developer.
                </p>
              </div>
            ) : (
              <form
                onSubmit={onSubmit}
                className="flex flex-1 flex-col gap-[13px]"
              >
                <div className="flex flex-1 flex-col gap-[8px]">
                  <div className="flex flex-col gap-[8px]">
                    <label
                      htmlFor="feedback"
                      className="font-poppins text-[14px] font-normal uppercase leading-[21px] text-[rgba(255,255,255,0.7)]"
                    >
                      What would you improve?
                    </label>
                    <textarea
                      id="feedback"
                      value={feedback}
                      onChange={(event) => onFeedbackChange(event.target.value)}
                      placeholder="E.g., colors, layout, flow, text clarity..."
                      className="font-poppins h-[200px] w-full resize-none overflow-hidden rounded-[8px] border border-[rgba(255,255,255,0.2)] bg-[#524974] px-[18px] py-[18px] text-[16px] font-normal leading-[1.2] text-white placeholder:text-white/70 focus:outline-none focus:ring-0 disabled:opacity-50"
                      rows={6}
                      required
                      disabled={isSubmitting}
                    />
                    {error && (
                      <p className="font-poppins text-[14px] font-normal leading-[21px] text-[#eb4cd8]">
                        {error}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-[20px]">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="font-poppins h-[48px] flex-1 rounded-[16px] bg-[rgba(2,0,17,0.7)] text-[18px] font-medium text-white shadow-[0px_10px_30px_0px_rgba(0,0,0,0.25)] transition-all hover:bg-[rgba(2,0,17,0.85)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? "Sending..." : "Submit"}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="font-poppins h-[48px] flex-1 rounded-[16px] bg-[rgba(12,7,41,0.26)] text-[18px] font-medium text-white shadow-[0px_10px_30px_0px_rgba(0,0,0,0.25)] transition-all hover:bg-[rgba(12,7,41,0.35)] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

import { useState } from "react";
import { createPortal } from "react-dom";
import { submitFeedback } from "../../api/notes";
import { FeedbackModal } from "./FeedbackModal";

const feedbackIconUrl = "/assets/icons/feedback-icon.svg";

/**
 * Optional feedback button for UI/UX testing
 * Enable via VITE_ENABLE_FEEDBACK=true
 */
export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling

    // Prevent double submission
    if (isSubmitting || hasSubmitted) {
      return;
    }

    setError(null);
    setIsSubmitting(true);
    setHasSubmitted(true);

    try {
      // Send feedback via API (emails to developer)
      await submitFeedback(feedback);

      // Also store locally as backup
      const feedbackEntry = {
        text: feedback,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleString(),
      };

      const stored = localStorage.getItem("gratitude_feedback");
      const existingFeedback = stored ? JSON.parse(stored) : [];
      existingFeedback.push(feedbackEntry);
      const recentFeedback = existingFeedback.slice(-50);
      localStorage.setItem(
        "gratitude_feedback",
        JSON.stringify(recentFeedback),
      );

      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setFeedback("");
        setSubmitted(false);
        setHasSubmitted(false); // Reset after modal closes
      }, 2000);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit feedback. Please try again.",
      );
      setHasSubmitted(false); // Reset on error so user can retry
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackChange = (value: string) => {
    setFeedback(value);
    setError(null);
  };

  return (
    <>
      {!isOpen &&
        createPortal(
          <button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[9999] flex items-center justify-center rounded-full border-2 border-solid border-white bg-transparent transition-all hover:bg-[rgba(255,255,255,0.1)]"
            style={{ width: "70px", height: "70px", padding: "15px" }}
            title="Share feedback"
          >
            <img
              src={feedbackIconUrl}
              alt="Feedback"
              className="h-[38px] w-[38px]"
            />
          </button>,
          document.body,
        )}

      <FeedbackModal
        isOpen={isOpen}
        feedback={feedback}
        submitted={submitted}
        error={error}
        isSubmitting={isSubmitting}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
        onFeedbackChange={handleFeedbackChange}
      />
    </>
  );
}

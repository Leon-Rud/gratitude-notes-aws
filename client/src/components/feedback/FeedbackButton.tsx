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
  const [rating, setRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = async (formattedFeedback: string) => {
    // Prevent double submission
    if (isSubmitting || hasSubmitted) {
      return;
    }

    setError(null);
    setIsSubmitting(true);
    setHasSubmitted(true);

    try {
      // Send feedback via API (emails to developer)
      await submitFeedback(formattedFeedback);

      // Also store locally as backup
      const feedbackEntry = {
        text: formattedFeedback,
        rating,
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
        setRating(null);
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

  const handleClose = () => {
    setIsOpen(false);
    setFeedback("");
    setRating(null);
    setSubmitted(false);
    setError(null);
    setHasSubmitted(false);
  };

  return (
    <>
      {createPortal(
        <button
          onClick={() => setIsOpen(true)}
          className="group fixed bottom-6 right-6 z-[9999] flex items-center justify-center rounded-[60px] border-2 border-solid border-white bg-transparent p-[21px] transition-all hover:bg-white"
          style={{ width: "70px", height: "70px" }}
          title="Share feedback"
        >
          <img
            src={feedbackIconUrl}
            alt="Feedback"
            className="h-[28px] w-[28px] transition-all group-hover:brightness-0"
          />
        </button>,
        document.body,
      )}

      <FeedbackModal
        isOpen={isOpen}
        feedback={feedback}
        rating={rating}
        submitted={submitted}
        error={error}
        isSubmitting={isSubmitting}
        onClose={handleClose}
        onSubmit={handleSubmit}
        onFeedbackChange={handleFeedbackChange}
        onRatingChange={setRating}
      />
    </>
  );
}

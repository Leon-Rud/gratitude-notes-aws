import { useState } from "react";
import { submitFeedback } from "../../api/notes";

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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
        title="Share feedback"
      >
        💬 Feedback
      </button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Share Your Feedback
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {submitted ? (
          <div className="py-4 text-center text-green-400">
            <p className="text-lg">✓ Thank you!</p>
            <p className="mt-2 text-sm text-slate-300">
              Your feedback has been emailed to the developer.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="feedback"
                className="block text-sm font-medium text-slate-300"
              >
                What would you improve?
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => {
                  setFeedback(e.target.value);
                  setError(null);
                }}
                placeholder="E.g., colors, layout, flow, text clarity..."
                className="mt-2 w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={5}
                required
                disabled={isSubmitting}
              />
            </div>
            {error && (
              <div className="rounded-md border border-red-600 bg-red-600/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Submit"}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="rounded-md border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

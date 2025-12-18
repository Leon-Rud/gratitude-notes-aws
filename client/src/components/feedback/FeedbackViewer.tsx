import { useState, useEffect } from "react";

/**
 * Simple viewer to see all collected feedback
 * Access it by opening browser console and running:
 * window.showFeedback()
 */
export function FeedbackViewer() {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Make it accessible globally
    (window as any).showFeedback = () => setIsOpen(true);

    // Load feedback when component mounts
    loadFeedback();
  }, []);

  const loadFeedback = () => {
    const stored = localStorage.getItem("gratitude_feedback");
    if (stored) {
      try {
        setFeedback(JSON.parse(stored).reverse()); // Show newest first
      } catch {
        setFeedback([]);
      }
    }
  };

  const clearFeedback = () => {
    if (confirm("Clear all feedback? This cannot be undone.")) {
      localStorage.removeItem("gratitude_feedback");
      setFeedback([]);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 max-h-[80vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-slate-700 bg-slate-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">
            Collected Feedback
          </h2>
          <div className="flex gap-2">
            <button
              onClick={clearFeedback}
              className="rounded-md border border-red-600 px-3 py-1 text-sm text-red-400 hover:bg-red-600/20"
            >
              Clear All
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        <div
          className="overflow-y-auto px-6 py-4"
          style={{ maxHeight: "calc(80vh - 80px)" }}
        >
          {feedback.length === 0 ? (
            <p className="text-center text-slate-400">
              No feedback collected yet.
            </p>
          ) : (
            <div className="space-y-4">
              {feedback.map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-slate-700 bg-slate-900 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-slate-400">{item.date}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-slate-200">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-700 px-6 py-3 text-center text-xs text-slate-400">
          Total: {feedback.length} feedback{" "}
          {feedback.length === 1 ? "entry" : "entries"}
        </div>
      </div>
    </>
  );
}


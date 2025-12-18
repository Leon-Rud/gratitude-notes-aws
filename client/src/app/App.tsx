import { useMemo, useEffect } from "react";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { LoginPage } from "../pages/LoginPage";
import { PublicFeedPage } from "../pages/PublicFeedPage";
import { FeedbackButton, FeedbackViewer } from "../components/feedback";

function AppContent() {
  const missingConfig = !(
    import.meta.env.VITE_API_BASE_URL as string | undefined
  )?.trim();
  const { isAuthenticated, user, logout } = useAuth();
  const enableFeedback =
    (
      import.meta.env.VITE_ENABLE_FEEDBACK as string | undefined
    )?.toLowerCase() === "true";

  // Handle hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      // If user is not authenticated and not on login, redirect to login
      if (!isAuthenticated && window.location.hash !== "#/login") {
        window.location.hash = "#/login";
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [isAuthenticated]);

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <header className="animate-fade-in">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex-1 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-500">
              Daily Gratitude Notes
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white">
              Share your daily gratitude
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              All gratitude notes are deleted at the end of the day.
            </p>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              {user.picture && (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-10 w-10 rounded-full border-2 border-slate-600"
                />
              )}
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <button
                  onClick={logout}
                  className="text-xs text-slate-400 transition-colors hover:text-slate-300"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {missingConfig && (
        <div className="rounded-lg border border-amber-500/60 bg-amber-500/10 p-4 text-sm text-amber-100">
          <p className="font-semibold">Environment not configured</p>
          <p className="mt-1">
            Set <code className="font-mono">VITE_API_BASE_URL</code> in a{" "}
            <code className="font-mono">.env.local</code> file.
          </p>
        </div>
      )}

      <section className="animate-fade-in">
        <PublicFeedPage />
      </section>

      <footer className="mt-12 text-center text-xs text-slate-500">
        © 2025 Daily Gratitude Notes
      </footer>

      {enableFeedback && (
        <>
          <FeedbackButton />
          <FeedbackViewer />
        </>
      )}
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

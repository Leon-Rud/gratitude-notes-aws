import { useEffect, useMemo, useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { AboutPage } from "./pages/AboutPage";
import { PublicFeed } from "./components/notes/PublicFeed";
import { FeedbackButton } from "./components/feedback";
import type { User } from "./contexts/AuthContext";

function FeedPage({
  user,
  logout,
  missingConfig,
  enableFeedback,
}: {
  user: User | null;
  logout: () => void;
  missingConfig: boolean;
  enableFeedback: boolean;
}) {
  return (
    <div className="relative min-h-screen w-full">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            backgroundImage:
              "url('/assets/images/backgrounds/feed-background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          aria-hidden="true"
        />
        {/* Figma uses an overlay tint with backdrop blur */}
        <div className="absolute inset-0 bg-[rgba(95,82,178,0.45)] backdrop-blur-[7.875px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        {/* Figma layout: left offset 37px, no matching right padding (content width = 1475). */}
        <div className="mx-auto flex w-full flex-col pl-[37px] pr-0">
          {/* Header */}
          {/* Figma header: positioned at y=17 with 16px internal padding and height ~112px */}
          <header className="mt-[17px] flex min-h-[112px] flex-col justify-start gap-4 p-[16px] sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col">
              <h1 className="font-poppins text-[32px] font-medium leading-tight text-white">
                SHARE YOUR DAILY GRATITUDE
              </h1>
              <p className="font-poppins mt-2 text-[20px] font-normal leading-none text-white">
                All notes are deleted at the end of the day.
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* User Avatar with Logout */}
              {user && (
                <div className="flex items-center gap-3">
                  <div className="relative h-[49px] w-[49px]">
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name || "User"}
                        className="h-full w-full rounded-full border-2 border-white/20 object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.src.startsWith("data:image/svg+xml")) {
                            console.error(
                              "Failed to load user picture:",
                              user.picture,
                            );
                            // Replace with fallback avatar
                            target.src = `data:image/svg+xml,${encodeURIComponent(
                              `<svg xmlns="http://www.w3.org/2000/svg" width="49" height="49" viewBox="0 0 49 49">
                                <circle cx="24.5" cy="24.5" r="24.5" fill="rgba(255,255,255,0.2)"/>
                                <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="white" font-size="20" font-family="Arial, sans-serif" font-weight="600">${(user.name || "U").charAt(0).toUpperCase()}</text>
                              </svg>`,
                            )}`;
                          }
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full border-2 border-white/20 bg-[rgba(255,255,255,0.2)]">
                        <span className="font-poppins text-lg font-semibold text-white">
                          {(user.name || "U").charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-poppins text-sm font-medium text-white">
                      {user.name}
                    </p>
                    <button
                      onClick={logout}
                      className="font-poppins text-xs text-white/70 transition-colors hover:text-white"
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

          {/* In Figma the cards start at y=155 while header ends at y=129 (gap ~26px). */}
          <section className="animate-fade-in mt-[26px] flex-1">
            <PublicFeed />
          </section>

          <footer className="mt-auto py-6 text-center text-xs text-white/50">
            © 2025 Daily Gratitude Notes
          </footer>
        </div>
      </div>

      {/* Feedback button - outside content container to ensure fixed positioning */}
      {enableFeedback && <FeedbackButton />}
    </div>
  );
}

function AppContent() {
  const missingConfig = !(
    import.meta.env.VITE_API_BASE_URL as string | undefined
  )?.trim();
  const { isAuthenticated, user, logout } = useAuth();
  const enableFeedback =
    (
      import.meta.env.VITE_ENABLE_FEEDBACK as string | undefined
    )?.toLowerCase() === "true";

  // Track hash reactively so navigation updates the UI.
  const [hash, setHash] = useState(() => window.location.hash || "#/login");

  // Keep hash state in sync with browser hash.
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || "");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Handle auth gating + defaults (Login -> About -> Feed).
  useEffect(() => {
    const current = window.location.hash || "";
    if (!isAuthenticated) {
      if (current !== "#/login") {
        window.location.hash = "#/login";
        setHash("#/login");
      }
      return;
    }

    // authenticated - default to feed page if no hash or coming from login
    if (!current || current === "#/login") {
      window.location.hash = "#/feed";
      setHash("#/feed");
    }
  }, [isAuthenticated]);

  // Render content based on hash - MUST be before any early returns to follow Rules of Hooks
  const CurrentPage = useMemo(() => {
    if (!isAuthenticated) return <LoginPage />;

    switch (hash) {
      case "#/about":
        return <AboutPage />;
      case "#/feed":
        return (
          <FeedPage
            user={user}
            logout={logout}
            missingConfig={missingConfig}
            enableFeedback={enableFeedback}
          />
        );
      default:
        return <AboutPage />;
    }
  }, [isAuthenticated, hash, user, logout, missingConfig, enableFeedback]);

  return <section className="animate-fade-in">{CurrentPage}</section>;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

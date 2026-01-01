import { useEffect, useMemo, useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { AboutPage } from "./pages/AboutPage";
import { GratitudeBoardPage } from "./pages/GratitudeBoardPage";
import { env, isApiConfigured } from "./lib/env";

function AppContent() {
  const missingConfig = !isApiConfigured();
  const { isAuthenticated, user, logout } = useAuth();
  const enableFeedback = env.enableFeedback;

  // Track hash reactively so navigation updates the UI.
  const [hash, setHash] = useState(() => window.location.hash || "#/login");

  // Keep hash state in sync with browser hash.
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || "");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Handle auth gating + defaults (Login -> About -> Feed).
  // About page is publicly accessible.
  useEffect(() => {
    const current = window.location.hash || "";
    if (!isAuthenticated) {
      // Allow public access to about page
      if (current !== "#/login" && current !== "#/about") {
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
    // About page is publicly accessible
    if (hash === "#/about") return <AboutPage />;

    if (!isAuthenticated) return <LoginPage />;

    switch (hash) {
      case "#/feed":
        return (
          <GratitudeBoardPage
            user={user}
            logout={logout}
            missingConfig={missingConfig}
            enableFeedback={enableFeedback}
          />
        );
      default:
        return (
          <GratitudeBoardPage
            user={user}
            logout={logout}
            missingConfig={missingConfig}
            enableFeedback={enableFeedback}
          />
        );
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

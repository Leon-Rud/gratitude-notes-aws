import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useGoogleLogin, googleLogout } from "@react-oauth/google";

export type User = {
  name: string;
  email: string;
  picture?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  triggerGoogleLogin: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "gratitude-auth-user";

function AuthProviderInner({
  children,
  onLogin,
}: {
  children: ReactNode;
  onLogin: (userData: User) => void;
}) {
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Fetch user info from Google's userinfo endpoint
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );
        const userInfo = await userInfoResponse.json();

        if (!userInfo.name || !userInfo.email) {
          throw new Error("Google profile is missing required fields (name/email).");
        }

        onLogin({
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture || undefined,
        });

        window.location.hash = "#/feed";
      } catch (error) {
        console.error("Failed to get user info:", error);
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
    },
  });

  return (
    <TriggerContext.Provider value={googleLogin}>
      {children}
    </TriggerContext.Provider>
  );
}

const TriggerContext = createContext<(() => void) | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem("gratitude-user-email");
    localStorage.removeItem("gratitude-user-note-id");
    googleLogout();
  };

  return (
    <AuthProviderInner onLogin={login}>
      <AuthContextInner user={user} login={login} logout={logout}>
        {children}
      </AuthContextInner>
    </AuthProviderInner>
  );
}

function AuthContextInner({
  children,
  user,
  login,
  logout,
}: {
  children: ReactNode;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}) {
  const googleLogin = useContext(TriggerContext);

  const triggerGoogleLogin = () => {
    if (googleLogin) {
      googleLogin();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        triggerGoogleLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

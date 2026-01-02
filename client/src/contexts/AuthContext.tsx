import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

export type User = {
  name: string;
  email: string;
  picture?: string;
};

type GoogleJwtPayload = {
  name?: string;
  email?: string;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const googleLoginRef = useRef<HTMLDivElement>(null);

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
    // Also clear other gratitude-related localStorage items
    localStorage.removeItem("gratitude-user-email");
    localStorage.removeItem("gratitude-user-note-id");
  };

  const handleGoogleSuccess = (credentialResponse: { credential?: string }) => {
    try {
      const token = credentialResponse?.credential;
      if (!token) {
        throw new Error("Missing Google credential");
      }

      const userData = jwtDecode<GoogleJwtPayload>(token);
      if (!userData.name || !userData.email) {
        throw new Error("Google profile is missing required fields (name/email).");
      }
      login({
        name: userData.name,
        email: userData.email,
        picture: userData.picture || undefined,
      });
      window.location.hash = "#/feed";
    } catch {
      // Silently handle token decode errors
    }
  };

  const handleGoogleError = () => {
    // Silently handle Google login errors
  };

  const triggerGoogleLogin = () => {
    const googleButton = googleLoginRef.current?.querySelector(
      'div[role="button"]'
    ) as HTMLElement;
    googleButton?.click();
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
      {/* Hidden Google Login button - rendered once at app root */}
      <div
        ref={googleLoginRef}
        className="pointer-events-none fixed opacity-0"
        aria-hidden="true"
      >
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap={false}
          theme="filled_blue"
          size="large"
          text="signin_with"
          shape="rectangular"
        />
      </div>
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

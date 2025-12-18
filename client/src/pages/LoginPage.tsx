import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../contexts/AuthContext";

type GoogleJwtPayload = {
  name?: string;
  email?: string;
  picture?: string;
};

export function LoginPage() {
  const { login } = useAuth();

  const navigate = () => {
    window.location.hash = "#/feed";
  };

  const handleSuccess = (credentialResponse: any) => {
    try {
      const token = credentialResponse?.credential;
      if (!token) {
        throw new Error("Missing Google credential");
      }

      // Note: For production security, verify this token on the backend.
      const userData = jwtDecode<GoogleJwtPayload>(token);

      if (!userData.name || !userData.email) {
        throw new Error(
          "Google profile is missing required fields (name/email).",
        );
      }

      login({
        name: userData.name,
        email: userData.email,
        picture: userData.picture,
      });

      navigate();
    } catch (error) {
      console.error("Failed to decode Google token:", error);
    }
  };

  const handleError = () => {
    console.error("Google login failed");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl bg-slate-800/80 p-8 shadow-lg ring-1 ring-slate-700">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-white">
              Daily Gratitude Notes
            </h1>
            <p className="mt-2 text-slate-300">
              Sign in to share your daily gratitude
            </p>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap={false}
              theme="filled_blue"
              size="large"
              text="signin_with"
              shape="rectangular"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

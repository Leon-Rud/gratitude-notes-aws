import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../contexts/AuthContext";
import { AboutUsLetsStartButton } from "../components/AboutUsLetsStartButton";
import { Typography } from "../components/ui";

type GoogleJwtPayload = {
  name?: string;
  email?: string;
  picture?: string;
};

const backgroundImageUrl = "/assets/images/backgrounds/login-background.png";

export function LoginPage() {
  const { login } = useAuth();

  const handleSuccess = (credentialResponse: { credential?: string }) => {
    try {
      const token = credentialResponse?.credential;
      if (!token) {
        throw new Error("Missing Google credential");
      }

      const userData = jwtDecode<GoogleJwtPayload>(token);
      if (!userData.name || !userData.email) {
        throw new Error(
          "Google profile is missing required fields (name/email).",
        );
      }
      login({
        name: userData.name,
        email: userData.email,
        picture: userData.picture || undefined,
      });
      window.location.hash = "#/about";
    } catch (error) {
      console.error("Failed to decode Google token:", error);
    }
  };

  const handleError = () => {
    console.error("Google login failed");
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background image */}
      <div className="pointer-events-none absolute inset-0">
        <img
          src={backgroundImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[rgba(95,82,178,0.45)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-screen flex-col justify-between overflow-hidden">
        {/* Hero section - Left side */}
        <div className="flex flex-1 items-start pb-4 pl-[calc(8.33%+2px)] pr-6 pt-20 sm:pl-[calc(8.33%+2px)] sm:pr-10 sm:pt-24 md:pl-[calc(8.33%+2px)] md:pr-16 md:pt-32">
          <div className="flex w-full max-w-[498px] flex-col gap-4 px-6 py-4 sm:gap-6 sm:px-10 sm:py-6 md:gap-8 md:px-10 md:py-8">
            <Typography
              variant="h1"
              as="h1"
              className="text-[48px] uppercase tracking-[-0.96px] text-white"
            >
              <span className="block">WELCOME TO</span>
              <span className="block whitespace-nowrap">GRATITUDE BOARD</span>
            </Typography>
            <p className="max-w-[402px] whitespace-nowrap font-poppins text-base font-normal leading-[1.2] text-white sm:text-lg md:text-xl lg:text-2xl">
              A quiet corner to notice the good in your day.
            </p>
            <p className="mt-[25px] max-w-[550px] whitespace-pre-wrap font-poppins text-[24px] font-normal leading-[1.2] text-white">
              Share what you're thankful for - and see what others appreciate
              today.
            </p>

            <AboutUsLetsStartButton
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import { jwtDecode } from "jwt-decode";
import { useAuth } from "../contexts/AuthContext";
import { FactCard } from "../components/FactCard";
import { SignInButton } from "../components/SignInButton";

type GoogleJwtPayload = {
  name?: string;
  email?: string;
  picture?: string;
};

const backgroundImageUrl = "/assets/images/backgrounds/login-background.png";

const facts = [
  "Increases happiness",
  "Improves sleep",
  "Reduces stress",
  "Strengthens relationships",
];

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
        picture: userData.picture,
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
          <div className="gap- flex w-full max-w-[498px] flex-col px-6 py-4 sm:gap-8 sm:px-10 sm:py-6 md:gap-12 md:px-10 md:py-8">
            <h1 className="font-poppins mt-[32px] flex flex-col gap-[32px] text-2xl font-semibold italic leading-[1.3] text-white sm:text-3xl md:gap-[32px] md:text-4xl lg:gap-[32px] lg:text-[48px]">
              <span>START YOUR DAY</span>
              <span>WITH GRATITUDE</span>
            </h1>
            <p className="font-poppins max-w-[402px] whitespace-pre-wrap text-base font-medium leading-[1.2] text-white sm:text-lg md:text-xl lg:text-2xl">
              Share what you're thankful for - and see what others appreciate
              today.
            </p>
            <SignInButton onSuccess={handleSuccess} onError={handleError} />
          </div>
        </div>

        {/* Facts section - Bottom */}
        <div className="flex flex-shrink-0 flex-col items-center gap-2 px-4 pb-2 sm:gap-3 sm:pb-3 md:gap-4 md:pb-4">
          <div className="hidden lg:block">
            <p className="font-poppins w-[239px] whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-[-0.32px] text-white sm:text-base">
              DID YOU KNOW THAT DAILY GRATITUDE PRACTICE:
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4">
            {facts.map((fact, index) => (
              <FactCard key={index} text={fact} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

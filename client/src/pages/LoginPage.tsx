import { AboutUsLetsStartButton } from "../components/about";
import { Typography } from "../components/ui";

const backgroundImageUrl = "/assets/images/backgrounds/login-background.png";

export function LoginPage() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background image with progressive blur */}
      <div className="pointer-events-none absolute inset-0">
        <img
          src={backgroundImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          aria-hidden="true"
        />
        {/* Color overlay without blur */}
        <div className="absolute inset-0 bg-ui-loginOverlay" />
        {/* Progressive blur layer - fades from blurred (top-left) to clear (bottom-right) */}
        <div
          className="absolute inset-0 backdrop-blur-[10px]"
          style={{
            maskImage:
              "linear-gradient(135deg, black 0%, black 45%, transparent 85%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(135deg, black 0%, black 45%, transparent 85%, transparent 100%)",
          }}
        />
      </div>

      {/* Content - responsive padding */}
      <div className="relative z-10 flex h-screen flex-col justify-center px-6 sm:px-12 lg:px-[142px]">
        <div className="flex max-w-[568px] flex-col gap-8">
          <Typography
            variant="h1"
            as="h1"
            className="text-[32px] uppercase leading-[1.2] tracking-[-0.96px] text-white sm:text-[40px] lg:text-[48px]"
          >
            WELCOME TO GRATITUDE BOARD
          </Typography>

          <p className="font-poppins text-[18px] font-normal leading-[1.2] text-white sm:text-[20px] lg:text-[24px]">
            A quiet corner to notice the good in your day.
          </p>

          <p className="max-w-[539px] font-poppins text-[18px] font-normal leading-[1.2] text-white sm:text-[20px] lg:text-[24px]">
            Share what you're thankful for - and see what others appreciate
            today.
          </p>

          <AboutUsLetsStartButton />
        </div>
      </div>
    </div>
  );
}

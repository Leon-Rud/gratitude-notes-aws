import { AboutUsLetsStartButton } from "../components/AboutUsLetsStartButton";
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
          className="absolute inset-0 backdrop-blur-[20px]"
          style={{
            maskImage: "linear-gradient(135deg, black 0%, black 20%, transparent 80%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(135deg, black 0%, black 20%, transparent 80%, transparent 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-screen flex-col justify-between overflow-hidden">
        {/* Hero section - Left side */}
        <div className="flex flex-1 items-start pb-4 pl-[calc(8.33%+2px)] pr-6 pt-20 sm:pl-[calc(8.33%+2px)] sm:pr-10 sm:pt-24 md:pl-[calc(8.33%+2px)] md:pr-16 md:pt-32">
          <div className="flex w-full max-w-[568px] flex-col px-6 py-4 sm:px-10 sm:py-6 md:px-10 md:py-8">
            <Typography
              variant="h1"
              as="h1"
              className="text-[48px] uppercase leading-[1.2] tracking-[-0.96px] text-white"
            >
              WELCOME TO GRATITUDE BOARD
            </Typography>
            <p className="mt-6 whitespace-nowrap font-poppins text-[24px] font-normal leading-[1.2] text-white">
              A quiet corner to notice the good in your day.
            </p>
            <p className="mt-[96px] max-w-[539px] font-poppins text-[24px] font-normal leading-[1.2] text-white">
              Share what you're thankful for - and see what others appreciate
              today.
            </p>

            <div className="mt-[32px]">
              <AboutUsLetsStartButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

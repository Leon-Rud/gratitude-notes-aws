import { useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";

const arrowUpRightUrl = "/assets/icons/arrow-up-right.svg";
// todo implement the new arrow up right icon

type AboutUsLetsStartButtonProps = {
  onSuccess: (credentialResponse: { credential?: string }) => void;
  onError: () => void;
};

type Active = "about" | "lets";

export function AboutUsLetsStartButton({
  onSuccess,
  onError,
}: AboutUsLetsStartButtonProps) {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Active>("about");

  const handleAboutUs = () => {
    window.location.hash = "#/about";
  };

  const handleLetsStart = () => {
    const googleButton = googleButtonRef.current?.querySelector(
      'div[role="button"]',
    ) as HTMLElement;
    googleButton?.click();
  };

  const spring = {
    type: "spring" as const,
    stiffness: 520,
    damping: 34,
    mass: 0.9,
  };

  return (
    <div className="relative">
      {/* Hidden Google Login button */}
      <div
        ref={googleButtonRef}
        className="pointer-events-none absolute opacity-0"
      >
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          useOneTap={false}
          theme="filled_blue"
          size="large"
          text="signin_with"
          shape="rectangular"
        />
      </div>

      {/* Outer container */}
      <div className="relative flex items-center overflow-hidden rounded-[50px] border-[1.5px] border-white bg-[rgba(255,255,255,0.1)] p-[10px] backdrop-blur-[7.5px]">
        {/* Use grid so the two halves are always identical */}
        <div className="grid  h-[62px] w-full grid-cols-2 gap-[10px]">
          {/* ABOUT */}
          <button
            type="button"
            onMouseEnter={() => setActive("about")}
            onFocus={() => setActive("about")}
            onClick={handleAboutUs}
            className="relative flex h-full min-w-0 items-center justify-center rounded-[60px] px-[20px] py-[10px]"
          >
            {/* Moving pill lives INSIDE whichever button is active */}
            {active === "about" && (
              <motion.div
                layoutId="pill"
                transition={spring}
                className="absolute inset-0 rounded-[60px] border border-[#d0d5dd] bg-[rgba(0,0,0,0.75)]"
              />
            )}

            <span className="relative z-10 flex min-w-0 items-center justify-center">
              <span className="whitespace-nowrap font-poppins text-[24px] font-light leading-normal tracking-[-0.36px] text-white">
                About Us
              </span>

              {/* Arrow animates in/out with a little slide */}
              <AnimatePresence initial={false}>
                {active === "about" && (
                  <motion.span
                    key="about-arrow"
                    initial={{ width: 0, opacity: 0, x: -8 }}
                    animate={{ width: 42, opacity: 1, x: 0 }}
                    exit={{ width: 0, opacity: 0, x: -8 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="ml-3 flex h-[42px] items-center justify-center overflow-hidden"
                  >
                    <img
                      src={arrowUpRightUrl}
                      alt=""
                    />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </button>

          {/* LET'S START */}
          <button
            type="button"
            onMouseEnter={() => setActive("lets")}
            onFocus={() => setActive("lets")}
            onClick={handleLetsStart}
            className="relative flex h-full min-w-0 items-center justify-center rounded-[60px] px-[20px] py-[10px]"
          >
            {active === "lets" && (
              <motion.div
                layoutId="pill"
                transition={spring}
                className="absolute inset-0 rounded-[60px] border border-[#d0d5dd] bg-[rgba(0,0,0,0.75)]"
              />
            )}

            <span className="relative z-10 flex min-w-0 items-center justify-center">
              <span className="whitespace-nowrap font-poppins text-[24px] font-light leading-normal tracking-[-0.36px] text-white">
                Let&apos;s Start
              </span>

              <AnimatePresence initial={false}>
                {active === "lets" && (
                  <motion.span
                    key="lets-arrow"
                    initial={{ width: 0, opacity: 0, x: -8 }}
                    animate={{ width: 42, opacity: 1, x: 0 }}
                    exit={{ width: 0, opacity: 0, x: -8 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="ml-3 flex h-[42px] items-center justify-center overflow-hidden"
                  >
                    <img
                      src={arrowUpRightUrl}
                      alt=""
                    />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

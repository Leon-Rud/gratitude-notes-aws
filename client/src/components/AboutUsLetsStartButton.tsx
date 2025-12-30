import { useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";

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

      {/* Outer container - fixed width 377px, height 82px per Figma */}
      <div className="relative flex h-[82px] w-[377px] items-center gap-[10px] overflow-hidden rounded-[50px] border-[1.5px] border-white bg-ui-glass p-[10px] backdrop-blur-glass">
        {/* ABOUT - width animates based on active state */}
        <motion.button
          type="button"
          onMouseEnter={() => setActive("about")}
          onFocus={() => setActive("about")}
          onClick={handleAboutUs}
          initial={false}
          animate={{ width: active === "about" ? 208 : 149 }}
          transition={spring}
          className="relative flex h-full items-center justify-center rounded-[60px] px-[20px] py-[10px]"
        >
          {active === "about" && (
            <motion.div
              layoutId="pill"
              transition={spring}
              className="absolute inset-0 rounded-[60px] border-[0.5px] border-[#d0d5dd] bg-ui-overlay"
            />
          )}

          <span className="relative z-10 flex items-center justify-center gap-0">
            <span className="whitespace-nowrap font-poppins text-[24px] font-light leading-normal tracking-[-0.36px] text-white">
              About Us
            </span>
            <motion.span
              initial={false}
              animate={{
                width: active === "about" ? 36 : 0,
                opacity: active === "about" ? 1 : 0
              }}
              transition={spring}
              className="flex h-[36px] items-center justify-center overflow-hidden"
            >
              <img src={arrowUpRightUrl} alt="" className="h-[36px] w-[36px] flex-shrink-0" />
            </motion.span>
          </span>
        </motion.button>

        {/* LET'S START - width animates based on active state */}
        <motion.button
          type="button"
          onMouseEnter={() => setActive("lets")}
          onFocus={() => setActive("lets")}
          onClick={handleLetsStart}
          initial={false}
          animate={{ width: active === "lets" ? 208 : 149 }}
          transition={spring}
          className="relative flex h-full items-center justify-center rounded-[60px] px-[20px] py-[10px]"
        >
          {active === "lets" && (
            <motion.div
              layoutId="pill"
              transition={spring}
              className="absolute inset-0 rounded-[60px] border-[0.5px] border-[#d0d5dd] bg-ui-overlay"
            />
          )}

          <span className="relative z-10 flex items-center justify-center gap-0">
            <span className="whitespace-nowrap font-poppins text-[24px] font-light leading-normal tracking-[-0.36px] text-white">
              Let&apos;s Start
            </span>
            <motion.span
              initial={false}
              animate={{
                width: active === "lets" ? 36 : 0,
                opacity: active === "lets" ? 1 : 0
              }}
              transition={spring}
              className="flex h-[36px] items-center justify-center overflow-hidden"
            >
              <img src={arrowUpRightUrl} alt="" className="h-[36px] w-[36px] flex-shrink-0" />
            </motion.span>
          </span>
        </motion.button>
      </div>
    </div>
  );
}

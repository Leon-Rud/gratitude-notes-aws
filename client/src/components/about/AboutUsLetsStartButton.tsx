import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

const arrowUpRightUrl = "/assets/icons/arrow-up-right.svg";

type Active = "about" | "lets";

export function AboutUsLetsStartButton() {
  const { triggerGoogleLogin } = useAuth();
  const [active, setActive] = useState<Active>("about");

  const handleAboutUs = () => {
    window.location.hash = "#/about";
  };

  const handleLetsStart = () => {
    triggerGoogleLogin();
  };

  const spring = {
    type: "spring" as const,
    stiffness: 520,
    damping: 34,
    mass: 0.9,
  };

  return (
    <div className="relative flex h-[62px] w-[300px] items-center gap-[6px] overflow-hidden rounded-[50px] border-[1.5px] border-white bg-ui-glass p-[8px] backdrop-blur-glass sm:h-[72px] sm:w-[340px] sm:gap-[7px] sm:p-[9px] lg:h-[82px] lg:w-[377px] lg:gap-[8px] lg:p-[10px]">
      {/* ABOUT - width animates based on active state */}
      <motion.button
        type="button"
        onMouseEnter={() => setActive("about")}
        onFocus={() => setActive("about")}
        onClick={handleAboutUs}
        initial={false}
        animate={{ width: active === "about" ? 208 : 149 }}
        transition={spring}
        className="relative flex h-full items-center justify-center rounded-[60px] px-[12px] py-[8px] sm:px-[16px] sm:py-[9px] lg:px-[20px] lg:py-[10px]"
      >
        {active === "about" && (
          <motion.div
            layoutId="pill"
            transition={spring}
            className="absolute inset-0 rounded-[60px] border-[0.5px] border-[#d0d5dd] bg-ui-overlay"
          />
        )}

        <span className="relative z-10 flex items-center justify-center gap-0">
          <span className="whitespace-nowrap font-poppins text-[18px] font-light leading-normal tracking-[-0.36px] text-white sm:text-[20px] lg:text-[24px]">
            About Us
          </span>
          <motion.span
            initial={false}
            animate={{
              width: active === "about" ? 36 : 0,
              opacity: active === "about" ? 1 : 0,
            }}
            transition={spring}
            className="flex h-[28px] items-center justify-center overflow-hidden sm:h-[32px] lg:h-[36px]"
          >
            <img
              src={arrowUpRightUrl}
              alt=""
              className="h-[28px] w-[28px] flex-shrink-0 sm:h-[32px] sm:w-[32px] lg:h-[36px] lg:w-[36px]"
            />
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
        className="relative flex h-full items-center justify-center rounded-[60px] px-[12px] py-[8px] sm:px-[16px] sm:py-[9px] lg:px-[20px] lg:py-[10px]"
      >
        {active === "lets" && (
          <motion.div
            layoutId="pill"
            transition={spring}
            className="absolute inset-0 rounded-[60px] border-[0.5px] border-[#d0d5dd] bg-ui-overlay"
          />
        )}

        <span className="relative z-10 flex items-center justify-center gap-0">
          <span className="whitespace-nowrap font-poppins text-[18px] font-light leading-normal tracking-[-0.36px] text-white sm:text-[20px] lg:text-[24px]">
            Let&apos;s Start
          </span>
          <motion.span
            initial={false}
            animate={{
              width: active === "lets" ? 36 : 0,
              opacity: active === "lets" ? 1 : 0,
            }}
            transition={spring}
            className="flex h-[28px] items-center justify-center overflow-hidden sm:h-[32px] lg:h-[36px]"
          >
            <img
              src={arrowUpRightUrl}
              alt=""
              className="h-[28px] w-[28px] flex-shrink-0 sm:h-[32px] sm:w-[32px] lg:h-[36px] lg:w-[36px]"
            />
          </motion.span>
        </span>
      </motion.button>
    </div>
  );
}

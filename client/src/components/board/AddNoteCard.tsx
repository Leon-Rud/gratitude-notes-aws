import { CARD_SHADOW } from "../../lib/constants";

interface AddNoteCardProps {
  disabled: boolean;
  onClick: () => void;
}

export function AddNoteCard({ disabled, onClick }: AddNoteCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group relative h-[320px] w-[320px] overflow-hidden rounded-card border-[1.5px] border-transparent bg-ui-loginOverlay ${CARD_SHADOW} backdrop-blur-glass ${
        disabled
          ? "cursor-not-allowed opacity-60"
          : "transition-all hover:-translate-y-0.5"
      }`}
    >
      <p className="absolute left-1/2 top-[24px] w-[282px] -translate-x-1/2 text-center font-poppins text-[20px] font-normal leading-[1.2] text-white">
        {disabled ? "One gratitude note a day 🌿" : "Add your gratitude note"}
      </p>
      <div className="absolute left-1/2 top-1/2 h-[70px] w-[70px] -translate-x-1/2 -translate-y-1/2">
        {/* Circle - outline by default, filled on hover */}
        <div
          className="absolute inset-0 rounded-full border-[1.5px] border-white bg-transparent transition-colors group-hover:border-transparent group-hover:bg-white"
          aria-hidden="true"
        />
        {/* Plus sign - white by default, black on hover */}
        <svg
          className="absolute left-1/2 top-1/2 h-[25px] w-[25px] -translate-x-1/2 -translate-y-1/2 text-white transition-colors group-hover:text-black"
          viewBox="0 0 25 25"
          fill="none"
          aria-label="Add note"
        >
          <path
            d="M12.5 0V25M0 12.5H25"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </button>
  );
}

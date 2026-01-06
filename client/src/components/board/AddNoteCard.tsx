import { CARD_SHADOW } from "../../lib/constants";

interface AddNoteCardProps {
  disabled: boolean;
  onClick: () => void;
}

export function AddNoteCard({ disabled, onClick }: AddNoteCardProps) {
  const hover = disabled
    ? ""
    : "transition-colors group-hover:border-transparent group-hover:bg-white";

  const plusHover = disabled ? "" : "transition-colors group-hover:text-black";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative h-[320px] w-[320px] overflow-hidden rounded-card border-[1.5px] border-transparent bg-ui-loginOverlay ${CARD_SHADOW} backdrop-blur-glass ${
        disabled ? "cursor-not-allowed opacity-60" : "group"
      }`}
    >
      <p className="absolute left-1/2 top-[24px] w-[282px] -translate-x-1/2 text-center font-poppins text-[20px] font-normal leading-[1.2] text-white">
        {disabled ? "One note per day keeps this space light and intentional." : "Add your gratitude note"}
      </p>

      <div className="absolute left-1/2 top-1/2 h-[70px] w-[70px] -translate-x-1/2 -translate-y-1/2">
        <div
          className={`absolute inset-0 rounded-full border-[1.5px] border-white bg-transparent ${hover}`}
          aria-hidden="true"
        />

        <svg
          className={`absolute left-1/2 top-1/2 h-[25px] w-[25px] -translate-x-1/2 -translate-y-1/2 text-white ${plusHover}`}
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

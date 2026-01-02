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
      className={`relative h-[336px] w-[336px] overflow-hidden rounded-card border-[1.5px] border-transparent bg-[rgba(95,82,178,0.35)] shadow-[0px_36px_10px_0px_rgba(0,0,0,0),0px_23px_9px_0px_rgba(0,0,0,0.01),0px_13px_8px_0px_rgba(0,0,0,0.05),0px_6px_6px_0px_rgba(0,0,0,0.09),0px_1px_3px_0px_rgba(0,0,0,0.1)] backdrop-blur-glass ${
        disabled
          ? "cursor-not-allowed opacity-60"
          : "transition-all hover:-translate-y-0.5"
      }`}
    >
      <p className="absolute left-1/2 top-[24px] w-[282px] -translate-x-1/2 text-center font-poppins text-[20px] font-normal leading-[1.2] text-white">
        {disabled ? "One gratitude note a day 🌿" : "Add your gratitude note"}
      </p>
      <div className="absolute left-1/2 top-1/2 h-[80px] w-[80px] -translate-x-1/2 -translate-y-1/2">
        <img
          src="/assets/icons/add-button-circle.svg"
          alt=""
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        />
        <img
          src="/assets/icons/add-button-plus.svg"
          alt="Add note"
          className="absolute left-1/2 top-1/2 h-[28px] w-[28px] -translate-x-1/2 -translate-y-1/2"
        />
      </div>
    </button>
  );
}

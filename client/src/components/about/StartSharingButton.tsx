export interface StartSharingButtonProps {
  href?: string;
  label?: string;
}

export function StartSharingButton({
  href = "#/feed",
  label = "Start Sharing",
}: StartSharingButtonProps) {
  const handleClick = () => {
    window.location.hash = href.replace("#", "");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex h-[82px] w-[257px] items-center justify-center rounded-pill-sm border-thin border-white bg-ui-glass p-[10px] backdrop-blur-glass"
    >
      <div className="flex h-[62px] w-[233px] items-center justify-center gap-2 rounded-pill border-[0.5px] border-ui-border bg-ui-overlay px-[20px] py-[10px]">
        <span className="whitespace-nowrap font-poppins text-[24px] font-light tracking-[-0.36px] text-design-text">
          {label}
        </span>
        <img
          src="/assets/icons/arrow-up-right.svg"
          alt=""
          className="block h-[36px] w-[36px] shrink-0 object-contain"
        />
      </div>
    </button>
  );
}

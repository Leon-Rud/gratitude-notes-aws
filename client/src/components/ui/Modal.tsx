import { createPortal } from "react-dom";
import { cn } from "../../lib/cn";
import { CloseIcon } from "./icons";

export type ModalPosition = "center" | "bottom-right";
export type OverlayVariant = "blur" | "blur-light" | "transparent" | "dark";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Modal position on screen */
  position?: ModalPosition;
  /** Overlay background style */
  overlay?: OverlayVariant;
  /** Additional class names for the content container */
  className?: string;
  /** Whether clicking the overlay closes the modal */
  closeOnOverlayClick?: boolean;
}

const overlayStyles: Record<OverlayVariant, string> = {
  blur: "bg-black/40 backdrop-blur-[5px]",
  "blur-light": "bg-[rgba(255,255,255,0.05)] backdrop-blur-[5px]",
  transparent: "bg-transparent",
  dark: "bg-black/60",
};

const positionStyles: Record<ModalPosition, string> = {
  center: "items-center justify-center",
  "bottom-right": "items-end justify-end pb-[85px] pr-[24px]",
};

export function Modal({
  isOpen,
  onClose,
  children,
  position = "center",
  overlay = "blur",
  className,
  closeOnOverlayClick = true,
}: ModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className={cn("fixed inset-0 z-40", overlayStyles[overlay])}
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Container */}
      <div
        className={cn(
          "pointer-events-none fixed inset-0 z-50 flex p-4",
          positionStyles[position]
        )}
      >
        <div
          className={cn("pointer-events-auto", className)}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </>,
    document.body
  );
}

export interface ModalHeaderProps {
  title: string;
  onClose?: () => void;
  className?: string;
}

export function ModalHeader({ title, onClose, className }: ModalHeaderProps) {
  return (
    <div
      className={cn(
        "flex h-[80px] items-center justify-between border-b border-[rgba(255,255,255,0.1)] px-[28px]",
        className
      )}
    >
      <h2 className="font-poppins text-[18px] font-normal leading-[27px] text-white">
        {title}
      </h2>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-ui-closeButton transition-colors hover:bg-ui-closeButtonHover"
          aria-label="Close"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}

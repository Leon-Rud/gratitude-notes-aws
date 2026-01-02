import { Modal } from "../ui";
import { CircleSpinnerIcon } from "../ui/icons";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false,
}: DeleteConfirmationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      overlay="blur-light"
      closeOnOverlayClick={!isLoading}
      className="h-[170px] w-[500px] overflow-hidden rounded-card border-[1.5px] border-[rgba(255,255,255,0.1)] shadow-[0_0_20px_rgba(169,109,206,0.4),0px_24px_60px_0px_rgba(0,0,0,0.25)]"
    >
      <div
        className="h-full w-full"
        style={{
          backgroundImage:
            "linear-gradient(161deg, rgba(42, 37, 88, 0.95) 0%, rgba(169, 109, 206, 0.9) 100%)",
        }}
      >
        {/* Header with separation line */}
        <div className="flex h-[80px] items-center border-b border-[rgba(255,255,255,0.1)] px-[39px]">
          <p className="font-poppins text-[18px] font-medium uppercase leading-[1.2] text-white">
            Are you sure you want to delete this note?
          </p>
        </div>
        {/* Body with buttons */}
        <div className="relative flex h-[90px] items-center justify-center p-[24px]">
          {/* Delete button - glass only */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="absolute left-[calc(50%-117px)] top-1/2 flex h-[48px] w-[214px] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-2 rounded-pill-sm bg-ui-glass font-poppins text-[18px] font-normal text-white transition-all hover:bg-ui-glassHover disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <CircleSpinnerIcon />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
          {/* Cancel button - black */}
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="absolute left-[calc(50%+117px)] top-1/2 flex h-[48px] w-[214px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill bg-ui-overlay font-poppins text-[18px] font-normal text-white transition-all hover:bg-ui-overlayHover disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}

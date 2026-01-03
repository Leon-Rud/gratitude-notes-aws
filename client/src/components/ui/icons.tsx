interface IconProps {
  className?: string;
}

export function EditIcon({ className = "h-4 w-[15px]" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 17.5237 17.5237"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13 1.19036C13.2189 0.971486 13.4787 0.797869 13.7647 0.679418C14.0507 0.560966 14.3571 0.5 14.6667 0.5C14.9762 0.5 15.2827 0.560966 15.5687 0.679418C15.8546 0.797869 16.1145 0.971486 16.3333 1.19036C16.5522 1.40923 16.7258 1.66906 16.8443 1.95503C16.9627 2.241 17.0237 2.54749 17.0237 2.85702C17.0237 3.16655 16.9627 3.47305 16.8443 3.75902C16.7258 4.04498 16.5522 4.30482 16.3333 4.52369L5.08334 15.7737L0.500012 17.0237L1.75001 12.4404L13 1.19036Z"
      />
    </svg>
  );
}

export function DeleteIcon({ className = "h-4 w-[15px]" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 16.5 18.1667"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M0.75 4.08333H2.41667M2.41667 4.08333H15.75M2.41667 4.08333V15.75C2.41667 16.192 2.59226 16.6159 2.90482 16.9285C3.21738 17.2411 3.64131 17.4167 4.08333 17.4167H12.4167C12.8587 17.4167 13.2826 17.2411 13.5952 16.9285C13.9077 16.6159 14.0833 16.192 14.0833 15.75V4.08333M4.91667 4.08333V2.41667C4.91667 1.97464 5.09226 1.55072 5.40482 1.23816C5.71738 0.925595 6.14131 0.75 6.58333 0.75H9.91667C10.3587 0.75 10.7826 0.925595 11.0952 1.23816C11.4077 1.55072 11.5833 1.97464 11.5833 2.41667V4.08333"
      />
    </svg>
  );
}

export function SpinnerIcon({ className = "h-4 w-4 animate-spin" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

export function CloseIcon({ className = "h-[14px] w-[14px]" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

export function CircleSpinnerIcon({ className = "h-5 w-5 animate-spin" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

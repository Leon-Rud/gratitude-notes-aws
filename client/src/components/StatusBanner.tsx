import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Dispatch, SetStateAction } from 'react';

export type StatusKind = 'success' | 'info' | 'warning' | 'error';

export type StatusState = {
  kind: StatusKind;
  title: string;
  message: string;
};

type StatusBannerProps = {
  status: StatusState | null;
  onClear: Dispatch<SetStateAction<StatusState | null>>;
};

const baseClasses =
  'rounded-lg border px-4 py-3 text-sm shadow-sm flex items-start justify-between gap-4 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

const styles: Record<StatusKind, { classes: string; Icon: typeof CheckCircleIcon }> = {
  success: { classes: `${baseClasses} border-emerald-500/70 bg-emerald-500/10 text-emerald-100`, Icon: CheckCircleIcon },
  info: { classes: `${baseClasses} border-blue-500/70 bg-blue-500/10 text-blue-100`, Icon: InformationCircleIcon },
  warning: { classes: `${baseClasses} border-amber-500/70 bg-amber-500/10 text-amber-100`, Icon: ExclamationTriangleIcon },
  error: { classes: `${baseClasses} border-rose-500/70 bg-rose-500/10 text-rose-100`, Icon: ExclamationCircleIcon }
};

export function StatusBanner({ status, onClear }: StatusBannerProps) {
  if (!status) return null;
  const { classes, Icon } = styles[status.kind];
  return (
    <div className={classes} role="status" aria-live="polite">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold">{status.title}</p>
          <p className="mt-1 text-xs text-white/80">{status.message}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onClear(null)}
        className="rounded-full bg-white/10 p-1 text-white/80 hover:bg-white/20"
        aria-label="Dismiss status message"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

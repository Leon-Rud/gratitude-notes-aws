import { TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type TextareaVariant = 'default' | 'subtle';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: TextareaVariant;
  error?: boolean;
}

const variantStyles: Record<TextareaVariant, string> = {
  default: 'bg-ui-input',
  subtle: 'bg-ui-inputSubtle',
};

export function Textarea({
  variant = 'default',
  error,
  className,
  ...props
}: TextareaProps) {
  return (
    <textarea
      className={cn(
        'w-full resize-none rounded-[8px] border-thin text-white placeholder:text-white/70',
        'focus:outline-none focus:ring-0',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        error ? 'border-error' : 'border-ui-glassBorder',
        className
      )}
      {...props}
    />
  );
}



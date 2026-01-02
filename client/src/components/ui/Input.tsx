import { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type InputVariant = 'default' | 'subtle';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  error?: boolean;
}

const variantStyles: Record<InputVariant, string> = {
  default: 'bg-ui-input',
  subtle: 'bg-ui-inputSubtle',
};

export function Input({
  variant = 'default',
  error,
  className,
  ...props
}: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-input border-thin text-white placeholder:text-white/70',
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





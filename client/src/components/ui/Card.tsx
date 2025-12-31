import { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type CardVariant = 'glass' | 'solid';
type CardPadding = 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
}

const variantStyles: Record<CardVariant, string> = {
  glass: 'bg-ui-glass border-thin border-ui-glassBorder backdrop-blur-glass rounded-card',
  solid: 'bg-ui-card rounded-card',
};

const paddingStyles: Record<CardPadding, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  variant = 'glass',
  padding = 'md',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(variantStyles[variant], paddingStyles[padding], className)}
      {...props}
    >
      {children}
    </div>
  );
}




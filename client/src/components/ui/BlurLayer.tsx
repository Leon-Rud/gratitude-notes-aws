import { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface BlurLayerProps extends HTMLAttributes<HTMLDivElement> {}

export function BlurLayer({ className, ...props }: BlurLayerProps) {
  return (
    <div
      className={cn(
        'bg-ui-loginOverlay backdrop-blur-hero w-full h-full pointer-events-none',
        className
      )}
      {...props}
    />
  );
}


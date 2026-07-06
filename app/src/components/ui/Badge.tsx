import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'info' | 'danger' | 'neutral';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'neutral', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold select-none border',
          {
            'bg-violet-500/12 text-violet-100 border-violet-300/25': variant === 'success',
            'bg-amber-400/10 text-amber-200 border-amber-300/25': variant === 'warning',
            'bg-fuchsia-500/10 text-fuchsia-100 border-fuchsia-300/25': variant === 'info',
            'bg-[#ff4d6d]/10 text-[#ff8aa0] border-[#ff4d6d]/25': variant === 'danger',
            'bg-white/7 text-zinc-300 border-white/10': variant === 'neutral',
          },
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

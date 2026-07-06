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
            'bg-[#c6ff00]/10 text-[#d9ff55] border-[#c6ff00]/25': variant === 'success',
            'bg-[#ffb000]/10 text-[#ffc84a] border-[#ffb000]/25': variant === 'warning',
            'bg-[#14b8a6]/10 text-[#5eead4] border-[#14b8a6]/25': variant === 'info',
            'bg-[#ff4d6d]/10 text-[#ff8aa0] border-[#ff4d6d]/25': variant === 'danger',
            'bg-white/7 text-stone-300 border-white/10': variant === 'neutral',
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

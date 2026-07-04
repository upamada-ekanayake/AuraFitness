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
            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20': variant === 'success',
            'bg-amber-500/10 text-amber-400 border-amber-500/20': variant === 'warning',
            'bg-indigo-500/10 text-indigo-400 border-indigo-500/20': variant === 'info',
            'bg-rose-500/10 text-rose-400 border-rose-500/20': variant === 'danger',
            'bg-slate-800 text-slate-300 border-slate-700': variant === 'neutral',
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

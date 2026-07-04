import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, subtitle, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl shadow-black/10',
          className
        )}
        {...props}
      >
        {(title || subtitle) && (
          <div className="mb-4">
            {title && <h3 className="text-lg font-bold text-slate-100 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

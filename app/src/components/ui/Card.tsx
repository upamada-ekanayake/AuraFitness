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
          'bg-[#111014]/78 backdrop-blur-xl border border-violet-200/8 rounded-2xl p-6 shadow-[0_20px_70px_rgba(0,0,0,0.26)]',
          className
        )}
        {...props}
      >
        {(title || subtitle) && (
          <div className="mb-4">
            {title && <h3 className="text-lg font-bold text-zinc-100 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

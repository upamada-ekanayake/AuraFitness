import React from 'react';
import { cn } from '../../utils/cn';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, subtitle, actions, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8', className)}
        {...props}
      >
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-sm text-slate-400 font-medium">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    );
  }
);

PageHeader.displayName = 'PageHeader';

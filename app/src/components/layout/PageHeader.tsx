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
          <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight text-pretty sm:text-3xl">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-sm text-zinc-400 font-medium">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    );
  }
);

PageHeader.displayName = 'PageHeader';

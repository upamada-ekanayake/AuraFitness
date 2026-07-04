import React from 'react';
import { cn } from '../../utils/cn';
import { Card } from './Card';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
  helper?: string;
  icon?: React.ReactNode;
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, label, value, helper, icon, ...props }, ref) => {
    return (
      <Card ref={ref} className={cn('relative overflow-hidden group', className)} {...props}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-100 tracking-tight">{value}</p>
            {helper && <p className="mt-1 text-xs text-slate-400 font-medium">{helper}</p>}
          </div>
          {icon && (
            <div className="p-3 rounded-xl bg-slate-800/40 text-indigo-400 group-hover:scale-105 group-hover:text-indigo-300 transition-all duration-350">
              {icon}
            </div>
          )}
        </div>
        
        {/* Subtle accent line on hover */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      </Card>
    );
  }
);

StatCard.displayName = 'StatCard';

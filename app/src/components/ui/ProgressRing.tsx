import React from 'react';
import { cn } from '../../utils/cn';

export interface ProgressRingProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  label?: string;
  size?: number;
}

export const ProgressRing = React.forwardRef<HTMLDivElement, ProgressRingProps>(
  ({ className, value, max = 100, label, size = 120, ...props }, ref) => {
    const radius = 50;
    const strokeWidth = 8;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    
    const percent = Math.min(Math.max((value / max) * 100, 0), 100);
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center justify-center text-center', className)}
        {...props}
      >
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            className="transform -rotate-90 w-full h-full"
            viewBox={`0 0 ${radius * 2} ${radius * 2}`}
          >
            {/* Gradient definition */}
            <defs>
              <linearGradient id="auraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>

            {/* Background Trail Circle */}
            <circle
              className="text-slate-800"
              stroke="currentColor"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />

            {/* Foreground Fill Circle */}
            <circle
              stroke="url(#auraGradient)"
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="transition-all duration-500 ease-out"
            />
          </svg>

          {/* Centered label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-100">
            <span className="text-xl font-bold tracking-tight">{Math.round(percent)}%</span>
            {label && <span className="text-[10px] text-slate-400 mt-0.5 tracking-wide uppercase font-semibold">{label}</span>}
          </div>
        </div>
      </div>
    );
  }
);

ProgressRing.displayName = 'ProgressRing';

import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 cursor-pointer outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98',
          {
            // Variants
            'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20': variant === 'primary',
            'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/50': variant === 'secondary',
            'bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-100': variant === 'ghost',
            'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20': variant === 'danger',
            
            // Sizes
            'px-3 py-1.5 text-xs': size === 'sm',
            'px-4 py-2.5 text-sm': size === 'md',
            'px-6 py-3.5 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

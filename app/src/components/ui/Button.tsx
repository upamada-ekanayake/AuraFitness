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
          'inline-flex items-center justify-center rounded-xl font-semibold transition-colors duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08070b] focus-visible:ring-violet-400 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 touch-manipulation',
          {
            // Variants
            'bg-violet-500 hover:bg-violet-400 text-white shadow-lg shadow-violet-950/35': variant === 'primary',
            'bg-white/7 hover:bg-white/11 text-zinc-100 border border-white/10': variant === 'secondary',
            'bg-transparent hover:bg-white/8 text-zinc-400 hover:text-zinc-100': variant === 'ghost',
            'bg-[#ff4d6d] hover:bg-[#ff6b85] text-white shadow-lg shadow-[#ff4d6d]/20': variant === 'danger',
            
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

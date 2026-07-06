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
          'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 cursor-pointer outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#080907] focus:ring-[#c6ff00] disabled:opacity-50 disabled:cursor-not-allowed active:scale-98',
          {
            // Variants
            'bg-[#c6ff00] hover:bg-[#d7ff42] text-[#11130b] shadow-lg shadow-[#c6ff00]/18': variant === 'primary',
            'bg-white/7 hover:bg-white/11 text-stone-100 border border-white/10': variant === 'secondary',
            'bg-transparent hover:bg-white/8 text-stone-400 hover:text-stone-100': variant === 'ghost',
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

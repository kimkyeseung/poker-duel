'use client';

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline' | 'player' | 'computer' | 'gold';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, fullWidth, children, disabled, ...props }, ref) => {
    const baseStyles = cn(
      'inline-flex items-center justify-center font-semibold rounded-full',
      'transition-all duration-200 ease-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0e1a]',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
      'active:scale-[0.98]'
    );

    const variants = {
      primary: cn(
        'bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white',
        'shadow-[0_4px_15px_rgba(0,102,255,0.3)]',
        'hover:shadow-[0_6px_25px_rgba(0,102,255,0.4)] hover:-translate-y-0.5',
        'focus:ring-[#00d4ff]'
      ),
      secondary: cn(
        'bg-[#1a1f35] text-white border border-white/10',
        'hover:bg-[#252b45] hover:border-white/20',
        'focus:ring-white/20'
      ),
      success: cn(
        'bg-gradient-to-r from-[#00ff88] to-[#00cc66] text-[#0a0e1a] font-bold',
        'shadow-[0_4px_15px_rgba(0,204,102,0.3)]',
        'hover:shadow-[0_6px_25px_rgba(0,204,102,0.4)] hover:-translate-y-0.5',
        'focus:ring-[#00ff88]'
      ),
      danger: cn(
        'bg-gradient-to-r from-[#ff4444] to-[#cc0000] text-white',
        'shadow-[0_4px_15px_rgba(255,68,68,0.3)]',
        'hover:shadow-[0_6px_25px_rgba(255,68,68,0.4)] hover:-translate-y-0.5',
        'focus:ring-[#ff4444]'
      ),
      ghost: cn(
        'bg-transparent text-[#a0aec0]',
        'hover:bg-[#1a1f35] hover:text-white',
        'focus:ring-white/20'
      ),
      outline: cn(
        'border-2 border-[#00d4ff] text-[#00d4ff] bg-transparent',
        'hover:bg-[#00d4ff]/10 hover:shadow-[0_0_20px_rgba(0,212,255,0.2)]',
        'focus:ring-[#00d4ff]'
      ),
      player: cn(
        'bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white',
        'shadow-[0_4px_15px_rgba(0,102,255,0.3)]',
        'hover:shadow-[0_6px_25px_rgba(0,102,255,0.4)] hover:-translate-y-0.5',
        'focus:ring-[#00d4ff]'
      ),
      computer: cn(
        'bg-gradient-to-r from-[#ff4d94] to-[#ff0080] text-white',
        'shadow-[0_4px_15px_rgba(255,77,148,0.3)]',
        'hover:shadow-[0_6px_25px_rgba(255,77,148,0.4)] hover:-translate-y-0.5',
        'focus:ring-[#ff4d94]'
      ),
      gold: cn(
        'bg-gradient-to-r from-[#ffd700] to-[#ffb800] text-[#0a0e1a] font-bold',
        'shadow-[0_4px_15px_rgba(255,215,0,0.3)]',
        'hover:shadow-[0_6px_25px_rgba(255,215,0,0.4)] hover:-translate-y-0.5',
        'focus:ring-[#ffd700]'
      ),
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm gap-1.5',
      md: 'px-6 py-3 text-base gap-2',
      lg: 'px-8 py-4 text-lg gap-2.5',
      xl: 'px-10 py-5 text-xl gap-3',
    };

    const iconSizes = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-7 w-7',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className={cn('animate-spin', iconSizes[size])}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className={iconSizes[size]} aria-hidden="true">{leftIcon}</span>}
            {children}
            {rightIcon && <span className={iconSizes[size]} aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };

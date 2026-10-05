import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      icon: Icon,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-[#598A31] text-white hover:bg-[#487226] focus:ring-[#598A31]/40 shadow-sm shadow-[#598A31]/25',
      secondary:
        'bg-[#f7f4ef] text-stone-800 hover:bg-[#dad0c3]/60 border border-[#dad0c3] focus:ring-stone-400',
      outline:
        'border border-[#dad0c3] text-stone-700 bg-white hover:bg-[#f7f4ef] hover:border-stone-400 focus:ring-[#598A31]/40 shadow-sm',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm',
      ghost:
        'text-stone-600 hover:bg-[#dad0c3]/30 hover:text-stone-900 focus:ring-stone-300',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
      md: 'text-sm px-4 py-2 gap-2 rounded-xl',
      lg: 'text-base px-5 py-2.5 gap-2.5 rounded-2xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : Icon ? (
          <Icon className="w-4 h-4" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

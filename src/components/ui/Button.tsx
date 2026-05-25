import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  sparkle?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', glow = false, sparkle = false, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
      primary: 'bg-orange-600 text-white hover:bg-orange-700 border-none shadow-sm',
      secondary: 'bg-orange-100 text-orange-900 hover:bg-orange-200 dark:bg-orange-900/35 dark:text-orange-100 shadow-sm',
      outline: 'border border-orange-500 text-orange-700 hover:bg-orange-50 dark:text-orange-300 dark:hover:bg-orange-950/30',
      ghost: 'text-orange-700 hover:bg-orange-50 dark:text-orange-300 dark:hover:bg-orange-950/30',
      gradient: 'bg-orange-600 text-white hover:bg-orange-700 border-none shadow-sm'
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    const glowClass = glow ? 'shadow-sm' : '';
    const sparkleClass = sparkle ? '' : '';

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${glowClass} ${sparkleClass} ${className}`}
        {...props}
      >
        <span>{props.children}</span>
      </button>
    );
  }
);
Button.displayName = 'Button';

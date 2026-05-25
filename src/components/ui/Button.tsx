import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  sparkle?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', glow = false, sparkle = false, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold tracking-tight transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden';

    const variants = {
      primary: 'bg-gradient-to-r from-slate-950 via-orange-700 to-rose-600 text-white shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 hover:brightness-105 dark:from-white dark:via-amber-200 dark:to-orange-200 dark:text-slate-950',
      secondary: 'bg-orange-100 text-orange-950 hover:bg-orange-200 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15',
      outline: 'border border-orange-300 bg-white/75 text-slate-900 hover:border-orange-400 hover:bg-orange-50 dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:border-amber-300/40 dark:hover:bg-white/10',
      ghost: 'text-orange-900 hover:bg-orange-50 dark:text-orange-100 dark:hover:bg-white/10',
      gradient: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/25 hover:-translate-y-0.5 hover:brightness-105'
    };

    const sizes = {
      sm: 'px-3.5 py-2 text-sm',
      md: 'px-4.5 py-2.5 text-sm md:text-base',
      lg: 'px-6 py-3.5 text-base md:text-lg'
    };

    const glowClass = glow ? 'shadow-[0_0_0_1px_rgba(251,191,36,0.2),0_18px_40px_rgba(249,115,22,0.22)]' : '';
    const enhancedClass = 'btn-enhanced';
    const sparkleClass = sparkle ? '' : '';

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${glowClass} ${sparkleClass} ${enhancedClass} ${className}`}
        {...props}
      >
        <span>{props.children}</span>
      </button>
    );
  }
);
Button.displayName = 'Button';

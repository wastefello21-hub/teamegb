import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: any;
  variant?: 'default' | 'elevated' | 'interactive';
  glow?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className = '', children, variant = 'default', glow = false, ...props }, ref) => {
    const baseStyles = 'glass relative overflow-hidden rounded-3xl p-5 sm:p-6 transition-all duration-300';

    const variants = {
      default: 'glass-hover border border-orange-200/60 dark:border-white/10',
      elevated: 'glass-hover shadow-xl border border-orange-200/60 hover:border-orange-300/60 dark:border-white/10',
      interactive: 'glass-hover cursor-pointer border border-orange-200/50 hover:border-orange-300/70 hover:-translate-y-1 dark:border-white/10'
    };

    const glowClass = glow ? 'hover:shadow-orange-500/15' : '';

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${glowClass} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassCard.displayName = 'GlassCard';

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
      default: 'glass-hover',
      elevated: 'glass-hover shadow-xl border border-transparent hover:border-amber-400/20',
      interactive: 'glass-hover cursor-pointer border border-transparent hover:border-amber-400/25 hover:-translate-y-1'
    };

    const glowClass = glow ? 'hover:shadow-amber-500/10' : '';

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

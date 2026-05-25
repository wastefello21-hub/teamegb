import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: any;
  variant?: 'default' | 'elevated' | 'interactive';
  glow?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className = '', children, variant = 'default', glow = false, ...props }, ref) => {
    const baseStyles = 'glass relative overflow-hidden rounded-2xl p-5 sm:p-6 transition-colors duration-200';

    const variants = {
      default: 'glass-hover',
      elevated: 'glass-hover shadow-lg border border-transparent hover:border-orange-500/15',
      interactive: 'glass-hover cursor-pointer border border-transparent hover:border-orange-500/20'
    };

    const glowClass = glow ? 'hover:shadow-orange-500/10' : '';

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

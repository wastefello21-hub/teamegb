import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'interactive';
  glow?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className = '', children, variant = 'default', glow = false, ...props }, ref) => {
    const baseStyles = 'glass relative overflow-hidden rounded-2xl p-5 sm:p-6 transition-all duration-500 ease-out';

    const variants = {
      default: 'glass-hover',
      elevated: 'glass-hover shadow-2xl hover:shadow-3xl border-2 border-transparent hover:border-orange-500/20',
      interactive: 'glass-hover cursor-pointer hover:scale-[1.02] active:scale-[0.98] border-2 border-transparent hover:border-orange-500/30'
    };

    const glowClass = glow ? 'hover:shadow-orange-500/20 hover:shadow-2xl' : '';

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${glowClass} ${className}`}
        {...props}
      >
        {children}
        {/* Subtle sparkle effect on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
          <div className="absolute top-2 right-2 w-1 h-1 bg-orange-400 rounded-full animate-sparkle delay-100"></div>
          <div className="absolute top-4 left-4 w-0.5 h-0.5 bg-yellow-400 rounded-full animate-sparkle delay-300"></div>
          <div className="absolute bottom-3 right-6 w-0.5 h-0.5 bg-red-400 rounded-full animate-sparkle delay-500"></div>
        </div>
      </div>
    );
  }
);
GlassCard.displayName = 'GlassCard';

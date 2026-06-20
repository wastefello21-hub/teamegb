import React from 'react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function PublicLayout({ children }: any) {
  return (
    <div className="public-shell flex min-h-screen flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.16),transparent_42%),radial-gradient(circle_at_left,rgba(59,130,246,0.08),transparent_24%)]" />
      <PublicNavbar />
      <main className="relative z-10 flex-grow pt-20 pb-24 md:pb-0">
        {children}
      </main>
      <footer className="surface-panel relative z-10 mt-20 py-8 border-t border-border-color">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-foreground/70 font-medium">
            © {new Date().getFullYear()} TEAM EGB Ganesha Festival. All rights reserved.
          </p>
          <p className="text-sm mt-2 text-foreground/50">
            Devotion • Faith • Trust
          </p>
          <div className="mt-6 flex justify-center">
            <SpeedInsights />
          </div>
        </div>
      </footer>
    </div>
  );
}

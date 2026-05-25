import React from 'react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function PublicLayout({ children }: any) {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <main className="flex-grow pt-20 pb-24 md:pb-0">
        {children}
      </main>
      <footer className="glass mt-20 py-8 border-t border-border-color">
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

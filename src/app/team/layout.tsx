"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wallet, List, LogOut } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function TeamLayout({ children }: any) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/team/login';
  const { settings } = useData();
  const { user, loading, logout, markAsOffline, statusMessage, clearStatusMessage } = useAuth();

  // Handle browser back button and navigation away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (user) {
        markAsOffline();
      }
    };

    const handlePopState = () => {
      if (user) {
        markAsOffline();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [user, markAsOffline]);

  // Clear status banner automatically after a short delay
  useEffect(() => {
    if (!statusMessage) return;

    const timeoutId = window.setTimeout(() => {
      clearStatusMessage();
    }, 4200);

    return () => window.clearTimeout(timeoutId);
  }, [statusMessage, clearStatusMessage]);

  // Check if user is authenticated
  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.push('/team/login');
    }
  }, [user, loading, isLoginPage, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900 dark:border-amber-400"></div>
      </div>
    );
  }

  if (isLoginPage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        {statusMessage && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 shadow-sm dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200">
            {statusMessage}
          </div>
        )}
        {children}
      </div>
    );
  }

  // If not logged in, don't render the team content
  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* Top Header */}
      <header className="glass sticky top-0 z-50 w-full border-b border-slate-200/80 shadow-sm bg-background/90 backdrop-blur-md dark:border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-amber-300/30 shadow-md bg-white/10">
              <Image 
                src="/logo_v2.jpg" 
                alt="TEAM EGB Logo" 
                fill 
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold text-slate-950 dark:text-slate-50">TEAM EGB</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-[0.22em] font-semibold">
                {settings?.festivalName?.includes('-') ? settings.festivalName.split('-')[0] : (settings?.festivalName || 'Ganesha Chaturthi')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => {
                logout();
                router.push('/team/login');
              }}
              className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/15"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {statusMessage && (
        <div className="mx-auto w-full max-w-6xl px-4 mt-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 shadow-sm dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200">
            {statusMessage}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow p-4">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 w-full glass border-t border-slate-200/80 flex justify-around p-3 pb-safe z-50 dark:border-white/10">
        <Link href="/team/dashboard" className={`flex flex-col items-center gap-1 ${pathname === '/team/dashboard' ? 'text-slate-950 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
          <Wallet size={24} />
          <span className="text-[10px] font-medium">Collect</span>
        </Link>
        <Link href="/team/my-collections" className={`flex flex-col items-center gap-1 ${pathname === '/team/my-collections' ? 'text-slate-950 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
          <List size={24} />
          <span className="text-[10px] font-medium">My Entries</span>
        </Link>
      </nav>
    </div>
  );
}

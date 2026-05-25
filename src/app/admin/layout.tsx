"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, Wallet, Image as ImageIcon, Settings, LogOut, Menu, X, MessageSquare, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: any) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings } = useData();
  const { user, loading, logout } = useAuth();
  const isLoginPage = pathname === '/admin/login';

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Check if user is authenticated
  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [user, loading, isLoginPage, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-200 border-t-amber-500 dark:border-white/15 dark:border-t-amber-400"></div>
      </div>
    );
  }

  if (isLoginPage) {
    return <div className="min-h-screen flex items-center justify-center p-4 bg-background">{children}</div>;
  }

  // If not logged in, don't render the admin content
  if (!user) {
    return null;
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Team Members', href: '/admin/team', icon: <Users size={20} /> },
    { name: 'Contributions', href: '/admin/contributions', icon: <Wallet size={20} /> },
    { name: 'Expenditures', href: '/admin/expenditure', icon: <Wallet size={20} /> },
    { name: 'Gallery', href: '/admin/gallery', icon: <ImageIcon size={20} /> },
    { name: 'Vlogs', href: '/admin/vlogs', icon: <ImageIcon size={20} /> },
    { name: 'Events', href: '/admin/events', icon: <Calendar size={20} /> },
    { name: 'Suggestions', href: '/admin/suggestions', icon: <MessageSquare size={20} /> },
    { name: 'Settings', href: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const SidebarContent = () => (
    <>
      <div className="h-24 flex items-center px-6 border-b border-slate-200/80 dark:border-white/10 shrink-0 gap-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden border border-amber-500/30">
          <Image 
            src="/logo_v2.jpg" 
            alt="TEAM EGB Logo" 
            fill 
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="font-semibold text-lg text-slate-950 dark:text-slate-50">Admin Panel</h1>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-[0.22em] font-semibold">
            {settings?.festivalName?.includes('-') ? settings.festivalName.split('-')[0] : (settings?.festivalName || 'TEAM EGB')}
          </p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-4">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              pathname === item.href 
                ? 'bg-slate-950 text-white shadow-md dark:bg-amber-400 dark:text-slate-950' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-slate-200/80 dark:border-white/10 shrink-0 flex flex-col gap-4">
        <div className="flex items-center justify-between px-4">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Theme</span>
          <ThemeToggle />
        </div>
        {/* Call logout then navigate to login to ensure session is cleared */}
        <button
          type="button"
          onClick={() => { logout(); router.push('/admin/login'); }}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_28%)]" />
      {/* Desktop Sidebar */}
      <aside className="w-64 flex-shrink-0 surface-panel border-r border-slate-200/80 dark:border-white/10 hidden md:flex flex-col z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="md:hidden fixed inset-y-0 left-0 w-64 surface-panel border-r border-slate-200/80 dark:border-white/10 flex flex-col z-50"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Mobile Header */}
        <header className="md:hidden surface-panel h-16 flex items-center justify-between px-4 border-b border-slate-200/80 dark:border-white/10 shrink-0 z-30">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-amber-500/30">
              <Image 
                src="/logo_v2.jpg" 
                alt="TEAM EGB Logo" 
                fill 
                className="object-cover"
              />
            </div>
            <h1 className="font-semibold text-lg text-slate-950 dark:text-slate-50">Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button 
              className="p-2 text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
               {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>
        
        <main className="relative flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/70 p-4 md:p-8 dark:bg-slate-950/20">
          {children}
        </main>
      </div>
    </div>
  );
}

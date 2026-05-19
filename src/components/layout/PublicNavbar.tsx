"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, CalendarDays, Camera, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useData } from '@/context/DataContext';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AnimatePresence, motion } from 'framer-motion';

export const PublicNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoViewerOpen, setIsLogoViewerOpen] = useState(false);
  const pathname = usePathname();
  const { settings } = useData();
  const isHomePage = pathname === '/';

  useEffect(() => {
    if (!isLogoViewerOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsLogoViewerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLogoViewerOpen]);

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Events', href: '/events' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'Contributors', href: '/contributors' },
    { name: 'E-Receipt', href: '/e-receipt' },
    { name: 'Expenditure', href: '/expenditure' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Suggestions', href: '/suggestions' },
    { name: 'About', href: '/about' },
  ];

  const quickLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Events', href: '/events', icon: CalendarDays },
    { name: 'Gallery', href: '/gallery', icon: Camera },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="hidden md:block fixed top-0 w-full z-50 glass border-b border-border-color shadow-lg shadow-black/5 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-between items-center h-20"
          >
            <div className="flex items-center">
              {isHomePage ? (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => setIsLogoViewerOpen(true)}
                  className="flex-shrink-0 flex items-center gap-3 text-left focus:outline-none group"
                  aria-label="Open festival logo photo"
                >
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500/40 shadow-lg shadow-orange-500/15 transition-all duration-300 group-hover:scale-105">
                    <Image
                      src="/logo_v2.jpg"
                      alt="TEAM EGB Logo"
                      fill
                      className="object-cover transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <motion.h1
                      className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600"
                      whileHover={{ scale: 1.01 }}
                    >
                      {settings?.festivalName?.includes('-') ? settings.festivalName.split('-')[0].trim() : (settings?.festivalName || 'TEAM EGB')}
                    </motion.h1>
                    <motion.p
                      className="text-[10px] font-bold text-orange-800 dark:text-yellow-500 uppercase tracking-[0.2em] transition-colors duration-300"
                      whileHover={{ scale: 1.01 }}
                    >
                      {settings?.festivalName?.includes('-') ? settings.festivalName.split('-')[1].trim() : 'Ganesha Chaturthi'}
                    </motion.p>
                  </div>
                </motion.button>
              ) : (
                <Link href="/" className="flex-shrink-0 flex items-center gap-3 group">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500/40 shadow-lg shadow-orange-500/15 transition-all duration-300 group-hover:scale-105">
                    <Image
                      src="/logo_v2.jpg"
                      alt="TEAM EGB Logo"
                      fill
                      className="object-cover transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <motion.h1
                      className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600"
                      whileHover={{ scale: 1.01 }}
                    >
                      {settings?.festivalName?.includes('-') ? settings.festivalName.split('-')[0].trim() : (settings?.festivalName || 'TEAM EGB')}
                    </motion.h1>
                    <motion.p
                      className="text-[10px] font-bold text-orange-800 dark:text-yellow-500 uppercase tracking-[0.2em] transition-colors duration-300"
                      whileHover={{ scale: 1.01 }}
                    >
                      {settings?.festivalName?.includes('-') ? settings.festivalName.split('-')[1].trim() : 'Ganesha Chaturthi'}
                    </motion.p>
                  </div>
                </Link>
              )}
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-all duration-300 hover:text-orange-600 dark:hover:text-orange-400 relative group ${
                    pathname === link.href ? 'text-orange-600 dark:text-orange-400' : 'text-foreground/80'
                  }`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-orange-500 transition-all duration-300 ${pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </Link>
              ))}
              <div className="flex gap-3 items-center">
                <ThemeToggle />
                <Link href="/team/login">
                  <Button variant="outline" size="sm">Team Login</Button>
                </Link>
                <Link href="/admin/login">
                  <Button variant="primary" size="sm" className="hidden sm:inline-flex">Admin Portal</Button>
                </Link>
              </div>
            </div>

            <div className="flex md:hidden items-center gap-3">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="text-foreground hover:text-orange-600 focus:outline-none transition-transform duration-200"
                aria-label="Toggle mobile menu"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </motion.div>
        </div>
      </motion.nav>

      <div className="md:hidden fixed top-0 left-0 w-full z-50 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-b border-border-color shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {isHomePage ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setIsLogoViewerOpen(true)}
              className="flex items-center gap-3 focus:outline-none group transition-all duration-200"
              aria-label="Open festival logo photo"
            >
              <div className="relative w-11 h-11 rounded-full overflow-hidden border border-orange-500/30 shadow-md bg-white/10 group-hover:border-orange-500/60 transition-colors duration-200">
                <Image
                  src="/logo_v2.jpg"
                  alt="TEAM EGB Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold text-foreground dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200">TEAM EGB</span>
                <span className="text-[11px] uppercase tracking-[0.2em] text-foreground/70">Ganesha Chaturthi</span>
              </div>
            </motion.button>
          ) : (
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-11 h-11 rounded-full overflow-hidden border border-orange-500/30 shadow-md bg-white/10 group-hover:border-orange-500/60 transition-colors duration-200">
                <Image
                  src="/logo_v2.jpg"
                  alt="TEAM EGB Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold text-foreground dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200">TEAM EGB</span>
                <span className="text-[11px] uppercase tracking-[0.2em] text-foreground/70">Ganesha Chaturthi</span>
              </div>
            </Link>
          )}

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-orange-600 focus:outline-none transition-transform duration-200"
              aria-label="Open navigation menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`md:hidden fixed top-[4.75rem] left-0 w-full bg-white/95 dark:bg-neutral-950/95 backdrop-blur-2xl border-b border-border-color shadow-xl z-40 transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-[560px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pt-4 pb-6 space-y-1 sm:px-3 flex flex-col">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-3 rounded-md text-base font-medium transition-all duration-300 hover:translate-x-1 ${
                pathname === link.href
                  ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-yellow-400'
                  : 'text-neutral-700 dark:text-neutral-200 hover:bg-orange-50 dark:hover:bg-orange-900/20'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="mt-4 px-3 flex flex-col gap-3">
            <Link href="/team/login" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full transition-all duration-200 hover:scale-[1.02]">Team Login</Button>
            </Link>
            <Link href="/admin/login" onClick={() => setIsOpen(false)}>
              <Button variant="primary" className="w-full bg-red-600 hover:bg-red-700 transition-all duration-200 hover:scale-[1.02]">Admin Portal</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 z-50 w-full bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border-t border-border-color md:hidden">
        <div className="flex justify-around items-center h-16 px-2">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 text-[10px] font-medium transition-all duration-200 ${
                  active
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 text-[10px] font-medium transition-all duration-200 ${
              isOpen
                ? 'text-red-600 dark:text-red-400'
                : 'text-foreground/60 hover:text-foreground'
            }`}
            aria-label="Open navigation menu"
          >
            <MoreHorizontal className="h-5 w-5" />
            <span>Menu</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isLogoViewerOpen && isHomePage && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsLogoViewerOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.82, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 12 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-md sm:max-w-lg"
            >
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-orange-400/20 via-yellow-300/10 to-transparent blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/90 dark:bg-neutral-950/90 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
                <button
                  type="button"
                  onClick={() => setIsLogoViewerOpen(false)}
                  className="absolute right-3 top-3 z-10 rounded-full bg-black/55 p-2 text-white backdrop-blur-md transition-transform hover:scale-105"
                  aria-label="Close logo preview"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="relative aspect-square w-full bg-gradient-to-br from-orange-100 via-white to-yellow-50 dark:from-neutral-900 dark:via-neutral-950 dark:to-black">
                  <Image
                    src="/logo_v2.jpg"
                    alt="TEAM EGB logo enlarged"
                    fill
                    sizes="(max-width: 640px) 90vw, 560px"
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="px-6 py-5 text-center">
                  {/* Removed 'Festival Photo' text as requested */}
                  <h2 className="mt-2 text-2xl font-black text-foreground">
                    {settings?.festivalName?.includes('-') ? settings.festivalName.split('-')[0].trim() : (settings?.festivalName || 'TEAM EGB')}
                  </h2>
                  <p className="mt-1 text-sm text-foreground/70">
                    Tap outside or press Escape to close
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

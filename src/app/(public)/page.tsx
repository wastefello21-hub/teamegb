"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Users, TrendingUp, Heart, Wallet, Play, Video, MessageSquarePlus, ThumbsUp, ThumbsDown, Phone, Mail, Image as ImageIcon } from 'lucide-react';
import { YoutubeIcon, InstagramIcon } from '@/components/ui/SocialIcons';
import Link from 'next/link';
import { useData, Photo } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { extractVideoThumbnail } from '@/lib/videoThumbnail';
import { AnimatePresence, motion } from 'framer-motion';
import { Playfair_Display } from 'next/font/google';

const introFont = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700'],
});

const isYouTubeUrl = (url: string) => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

function HomeMediaTile({
  media,
  onSelect,
  priority = false,
}: {
  media: Photo;
  onSelect: () => void;
  priority?: boolean;
}) {
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [isThumbnailLoading, setIsThumbnailLoading] = useState(false);

  // Extract thumbnail for non-YouTube videos with staggered loading
  useEffect(() => {
    if (media.type === 'video' && !isYouTubeUrl(media.url) && !videoThumbnail) {
      setIsThumbnailLoading(true);
      // Add delay to prevent overwhelming the browser
      const timeoutId = setTimeout(async () => {
        try {
          const thumbnail = await extractVideoThumbnail(media.url, 0.5);
          setVideoThumbnail(thumbnail);
        } catch (error) {
          console.error('Failed to extract video thumbnail:', error);
        } finally {
          setIsThumbnailLoading(false);
        }
      }, Math.random() * 200); // Stagger thumbnail extraction

      return () => clearTimeout(timeoutId);
    }
  }, [media.type, media.url, videoThumbnail]);

  return (
    <div
      className="relative group cursor-pointer"
      onClick={onSelect}
    >
      <div className={`relative aspect-square rounded-2xl overflow-hidden shadow-lg border border-white/5 bg-black/10`}>
        {media.type === 'video' ? (
          <div className="w-full h-full relative bg-gradient-to-br from-black/80 via-zinc-900 to-black">
            <Image
              src={(media as any).thumbnail_url ?? (isYouTubeUrl(media.url) ? `https://img.youtube.com/vi/${getYouTubeId(media.url)}/hqdefault.jpg` : (videoThumbnail ?? media.url))}
              alt={media.caption}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              quality={priority ? 80 : 60}
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
            />
            {/* Only show overlay while loading */}
            {isThumbnailLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
            {/* Play button overlay - always visible */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors duration-200">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 transform group-hover:scale-110 transition-transform duration-200">
                <Play size={18} fill="currentColor" />
              </div>
            </div>
            <div className="absolute top-2 right-2 p-1 rounded-lg bg-black/40 backdrop-blur-md text-white border border-white/10">
              <Video size={12} />
            </div>
          </div>
        ) : (
          <>
            <Image
              src={media.url}
              alt={media.caption}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              quality={priority ? 85 : 60}
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
            />
            <div className="absolute top-2 right-2 p-1 rounded-lg bg-black/40 backdrop-blur-md text-white border border-white/10">
              <ImageIcon size={12} />
            </div>
          </>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3">
          <h3 className="text-white text-xs font-bold line-clamp-2">{media.caption}</h3>
        </div>
      </div>
    </div>
  );
}
export default function HomePage() {
  const { totalCollection, totalExpenditure, balance, contributions, gallery, settings, suggestions, voteSuggestion } = useData();
  const { isAdmin } = useAuth();
  const [votedItems, setVotedItems] = useState<Record<string, 'up' | 'down'>>({});
  const [selectedMedia, setSelectedMedia] = useState<typeof gallery[0] | null>(null);
  const [revealedCount, setRevealedCount] = useState(0);
  const [introVisible, setIntroVisible] = useState(true);
  const [introPhase, setIntroPhase] = useState<'logo-in' | 'typing' | 'logo-out'>('logo-in');
  const [typedText, setTypedText] = useState('');

  const handleVote = async (id: string, type: 'up' | 'down') => {
    if (votedItems[id] === type) return;
    try {
      const success = await voteSuggestion(id, type === 'up' ? 'like' : 'dislike');
      if (success) {
        setVotedItems(prev => ({ ...prev, [id]: type }));
      }
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  // Format currencies
  const formatCurrency = (val: number) => `₹ ${val.toLocaleString('en-IN')}`;

  const analytics = {
    totalContributions: formatCurrency(totalCollection),
    contributors: contributions.length,
    expenditure: formatCurrency(totalExpenditure),
    balance: formatCurrency(balance)
  };

  // Get most recent 4
  const recentContributions = contributions.slice(0, 4).map((c, i) => ({
    id: c.id,
    name: c.name,
    amount: c.amount,
    date: c.date || (i === 0 ? "Just now" : "Recently")
  }));

  const showcaseItems = [...gallery].sort((a, b) => Number(b.year) - Number(a.year)).slice(0, 8);
  const showcaseKey = showcaseItems.map(item => item.id).join('|');
  const sectionTitleClass = 'text-3xl md:text-4xl font-bold tracking-tight text-slate-950 dark:text-slate-50';
  const sectionSubtitleClass = 'text-sm md:text-base text-slate-600 dark:text-slate-300';

  useEffect(() => {
    setRevealedCount(showcaseItems.length > 0 ? 1 : 0);
  }, [showcaseKey, showcaseItems.length]);

  useEffect(() => {
    const welcomeText = 'Team EGB Welcomes You!';

    const logoInTimer = window.setTimeout(() => {
      setIntroPhase('typing');
    }, 900);

    let typingInterval: number | undefined;
    const typingTimer = window.setTimeout(() => {
      let index = 0;
      typingInterval = window.setInterval(() => {
        index += 1;
        setTypedText(welcomeText.slice(0, index));

        if (index >= welcomeText.length && typingInterval) {
          window.clearInterval(typingInterval);
        }
      }, 72);
    }, 1150);

    const fadeOutTimer = window.setTimeout(() => {
      setIntroPhase('logo-out');
    }, 3550);

    const hideTimer = window.setTimeout(() => {
      setIntroVisible(false);
    }, 4400);

    return () => {
      window.clearTimeout(logoInTimer);
      window.clearTimeout(typingTimer);
      window.clearTimeout(fadeOutTimer);
      window.clearTimeout(hideTimer);
      if (typingInterval) {
        window.clearInterval(typingInterval);
      }
    };
  }, []);

  useEffect(() => {
    if (revealedCount === 0 || revealedCount >= showcaseItems.length) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRevealedCount(prev => Math.min(prev + 1, showcaseItems.length));
    }, revealedCount === 1 ? 140 : 220);

    return () => window.clearTimeout(timeoutId);
  }, [revealedCount, showcaseItems.length]);

  return (
    <div className="flex flex-col items-center w-full scroll-smooth">
      <AnimatePresence>
        {introVisible && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: introPhase === 'logo-out' ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.05, ease: 'easeInOut' }}
            className="intro-overlay-only flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0">
              <Image
                src="/logo_v2.jpg"
                alt="Intro background"
                fill
                priority
                className="object-cover object-center scale-115 opacity-55 saturate-150 contrast-110 blur-[1px]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/98 via-slate-950/88 to-slate-950/98" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.24),transparent_28%),radial-gradient(circle_at_top,rgba(248,113,113,0.16),transparent_26%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.1),transparent_34%),radial-gradient(circle_at_left,rgba(255,255,255,0.08),transparent_20%)]" />
              <motion.div
                aria-hidden="true"
                className="absolute inset-0 opacity-35"
                animate={{ x: ['-22%', '22%', '-22%'] }}
                transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="absolute left-[-18%] top-[14%] h-[1px] w-[50%] bg-gradient-to-r from-transparent via-amber-200/70 to-transparent" />
                <div className="absolute right-[-18%] top-[78%] h-[1px] w-[52%] bg-gradient-to-r from-transparent via-white/35 to-transparent" />
              </motion.div>

              <motion.div
                aria-hidden="true"
                className="absolute inset-[-20%] opacity-30"
                animate={{ rotate: 360 }}
                transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
              >
                <div className="absolute inset-[14%] rounded-full border border-amber-300/18 shadow-[0_0_90px_rgba(251,191,36,0.08)]" />
                <div className="absolute inset-[24%] rounded-full border border-white/10" />
                <div className="absolute inset-[34%] rounded-full border border-amber-100/8" />
              </motion.div>

              {[
                { top: '14%', left: '12%', size: '1.4rem', delay: 0 },
                { top: '20%', left: '78%', size: '0.95rem', delay: 0.8 },
                { top: '68%', left: '16%', size: '0.85rem', delay: 1.4 },
                { top: '72%', left: '82%', size: '1.1rem', delay: 0.3 },
                { top: '40%', left: '8%', size: '0.7rem', delay: 1.8 },
                { top: '34%', left: '88%', size: '0.8rem', delay: 1.1 },
              ].map((orb) => (
                <motion.span
                  key={`${orb.top}-${orb.left}`}
                  aria-hidden="true"
                  className="absolute rounded-full bg-amber-200/70 shadow-[0_0_25px_rgba(251,191,36,0.55)]"
                  style={{ top: orb.top, left: orb.left, width: orb.size, height: orb.size }}
                  animate={{ opacity: [0.2, 0.95, 0.2], y: [0, -18, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 6.5, repeat: Infinity, delay: orb.delay, ease: 'easeInOut' }}
                />
              ))}

              <div className="absolute left-6 top-6 h-12 w-12 border-l border-t border-amber-200/20" />
              <div className="absolute right-6 top-6 h-12 w-12 border-r border-t border-amber-200/20" />
              <div className="absolute left-6 bottom-6 h-12 w-12 border-l border-b border-amber-200/20" />
              <div className="absolute right-6 bottom-6 h-12 w-12 border-r border-b border-amber-200/20" />

              <div className="absolute inset-0 backdrop-blur-[1px]" />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 18 }}
              animate={introPhase === 'logo-out' ? { opacity: 0, scale: 1.04, y: -12 } : { opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
              className="relative z-10 flex flex-col items-center justify-center text-center px-6"
            >
              <motion.div
                aria-hidden="true"
                className="absolute inset-0 -z-20 mx-auto my-auto h-[34rem] w-[34rem] max-w-[92vw] rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.18),transparent_58%)] blur-3xl"
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              />

              <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-amber-200/20 bg-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.45em] text-amber-100/90 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
                <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.8)]" />
                Ganesha Chaturthi 2026
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.82 }}
                animate={introPhase === 'logo-out' ? { opacity: 0, scale: 1.05 } : { opacity: 1, scale: 1 }}
                transition={{ duration: 0.75, ease: 'easeOut' }}
                className="relative mb-8 h-36 w-36 md:h-44 md:w-44 rounded-full overflow-hidden border border-amber-300/25 bg-white/8 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-md ring-1 ring-white/10"
              >
                <motion.div
                  aria-hidden="true"
                  className="absolute inset-[-12%] rounded-full border border-amber-200/25"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  aria-hidden="true"
                  className="absolute inset-3 rounded-full border border-white/10"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                />
                <Image
                  src="/logo_v2.jpg"
                  alt="TEAM EGB logo"
                  fill
                  priority
                  className="object-cover"
                />
                <motion.div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(115deg,transparent_20%,rgba(255,255,255,0.18)_46%,transparent_62%)] opacity-40"
                  animate={{ x: ['-110%', '110%'] }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2.5 }}
                />
              </motion.div>

              <div className="min-h-[5.2rem] flex items-center justify-center px-2">
                <p className={`${introFont.className} text-3xl sm:text-4xl md:text-6xl font-semibold tracking-[0.04em] bg-gradient-to-r from-amber-100 via-amber-50 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_2px_24px_rgba(0,0,0,0.62)]`}>
                  {typedText}
                  <span className="ml-1 inline-block h-[1.1em] w-[2px] translate-y-[2px] bg-amber-300 align-middle shadow-[0_0_14px_rgba(251,191,36,0.9)] animate-pulse" />
                </p>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={introPhase === 'logo-out' ? { opacity: 0, y: -4 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.35 }}
                className="mt-4 max-w-2xl text-sm sm:text-base md:text-lg text-slate-200/82 tracking-[0.22em] uppercase"
              >
                Devotion · Faith · Unity
              </motion.p>

              <motion.div
                aria-hidden="true"
                className="mt-6 h-[2px] w-40 overflow-hidden rounded-full bg-white/10"
                animate={{ opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="h-full w-full bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative w-full min-h-[92vh] flex flex-col items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 z-[-1]">
          <Image 
            src="/logo_v2.jpg" 
            alt="Festival Background" 
            fill
            className="object-cover opacity-72 md:opacity-82 scale-110 saturate-125 contrast-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/54 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.28),transparent_28%),radial-gradient(circle_at_bottom,rgba(244,63,94,0.18),transparent_38%),radial-gradient(circle_at_left,rgba(251,191,36,0.1),transparent_28%)]" />
        </div>

        <div 
          className="surface-panel text-center px-6 md:px-12 max-w-5xl z-10 py-12 rounded-[2rem] glass-hover dark:bg-slate-950/60"
        >
          <div
            className="section-kicker mb-6"
          >
            Ganesha Chaturthi Celebration
          </div>
          <h1 className="text-5xl md:text-8xl font-extrabold mb-4 tracking-tight leading-[0.92] text-slate-950 dark:text-white">
            {settings?.festivalName?.includes('-') ? settings.festivalName.split('-')[0].trim() : (settings?.festivalName || 'TEAM EGB')}
            <br />
            <span className="text-4xl md:text-6xl block mt-3 font-semibold festival-highlight">
              {settings?.festivalName?.includes('-') ? settings.festivalName.split('-')[1].trim() : 'Ganesha Chaturthi Celebrations'}
            </span>
          </h1>
          
          <p
            className="text-lg md:text-2xl font-medium mb-12 text-slate-700 dark:text-slate-100 max-w-2xl mx-auto"
          >
            Celebrating devotion, faith, and youth unity.
          </p>
          
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-4"
          >
            <Link href="#contributions" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="gradient"
                className="w-full text-lg px-8 py-4 rounded-2xl shadow-lg shadow-orange-500/30 border-0 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                View Contributions
              </Button>
            </Link>
            <Link href="/gallery" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full text-lg px-8 py-4 rounded-2xl shadow-lg shadow-orange-500/10 border-0 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                View Gallery
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Analytics Dashboard */}
      <section className="section-shell w-full px-4 py-20" id="contributions">
        <div
          className="text-center mb-12"
        >
          <h2
            className={`${sectionTitleClass} mb-4`}
          >
            Transparency Matters
          </h2>
          <p
            className={`max-w-2xl mx-auto ${sectionSubtitleClass}`}
          >
            We believe in complete transparency. Every rupee contributed by you is accounted for and utilized for the divine celebration.
          </p>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div>
            <Link href="/analytics" className="block">
              <GlassCard variant="default" className="relative overflow-hidden h-full border border-orange-200/70 bg-gradient-to-br from-white/95 to-orange-50/90 shadow-sm dark:from-slate-950/70 dark:to-orange-950/12 dark:border-orange-500/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 icon-badge">
                    <Wallet className="w-6 h-6 text-amber-700 dark:text-amber-300" />
                  </div>
                  <h3 className="font-semibold text-slate-700 dark:text-slate-100">Total Collection</h3>
                </div>
                <p className="text-3xl font-semibold text-slate-950 dark:text-white">
                  {analytics.totalContributions}
                </p>
              </GlassCard>
            </Link>
          </div>

          <div>
            <Link href="/contributors" className="block">
              <GlassCard variant="default" className="relative overflow-hidden h-full border border-sky-200/70 bg-gradient-to-br from-white/95 to-sky-50/90 shadow-sm dark:from-slate-950/70 dark:to-sky-950/12 dark:border-sky-500/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 icon-badge">
                    <Users className="w-6 h-6 text-sky-700 dark:text-sky-300" />
                  </div>
                  <h3 className="font-semibold text-slate-700 dark:text-slate-100">Contributors</h3>
                </div>
                <p className="text-3xl font-semibold text-slate-950 dark:text-white">
                  {analytics.contributors}
                </p>
              </GlassCard>
            </Link>
          </div>

          <div>
            <Link href="/expenditure" className="block">
              <GlassCard variant="default" className="relative overflow-hidden h-full border border-rose-200/70 bg-gradient-to-br from-white/95 to-rose-50/90 shadow-sm dark:from-slate-950/70 dark:to-rose-950/12 dark:border-rose-500/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 icon-badge">
                    <TrendingUp className="w-6 h-6 text-rose-700 dark:text-rose-300" />
                  </div>
                  <h3 className="font-semibold text-slate-700 dark:text-slate-100">Expenditure</h3>
                </div>
                <p className="text-3xl font-semibold text-slate-950 dark:text-white">
                  {analytics.expenditure}
                </p>
              </GlassCard>
            </Link>
          </div>

          <div>
            <GlassCard variant="default" className="relative overflow-hidden border border-emerald-200/70 bg-gradient-to-br from-white/95 to-emerald-50/90 shadow-sm dark:from-slate-950/70 dark:to-emerald-950/12 dark:border-emerald-500/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 icon-badge">
                  <Heart className="w-6 h-6 text-emerald-700 dark:text-emerald-300" />
                </div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-100">Balance</h3>
              </div>
              <p className="text-3xl font-semibold text-slate-950 dark:text-white">
                {analytics.balance}
              </p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Glimpses of Devotion */}
      <section className="section-shell w-full px-4 pb-32">
        <div
          className="mb-10 px-4"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-6">
            <div className="text-center">
              <h2
                className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-tight"
              >
                Glimpses of Devotion
              </h2>
              <p
                className={`mt-2 max-w-2xl mx-auto ${sectionSubtitleClass}`}
              >
                Beautiful moments captured during our celebrations.
              </p>
            </div>
            <div
            >
              <Link href="/gallery" className="w-full md:w-auto md:ml-8">
                <Button className="w-full md:w-auto bg-slate-950 text-white hover:bg-slate-800 font-semibold px-6 py-3 rounded-2xl shadow-lg shadow-slate-950/15 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]">
                  View All Gallery
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div
          className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar px-4 -mx-4"
        >
          {showcaseItems.map((media, index) => (
            index < revealedCount ? (
              <div
                key={media.id}
                className="snap-center shrink-0 w-[280px] sm:w-[320px]"
              >
                <HomeMediaTile
                  media={media}
                  onSelect={() => setSelectedMedia(media)}
                  priority={index < 2}
                />
              </div>
            ) : (
              <div
                key={`${media.id}-placeholder`}
                className="snap-center shrink-0 w-[280px] sm:w-[320px] rounded-3xl overflow-hidden shadow-2xl relative group border border-white/5 bg-muted/20 animate-pulse"
              >
                <div className="aspect-[9/16] w-full bg-gradient-to-br from-muted/10 via-muted/20 to-muted/10" />
              </div>
            )
          ))}
        </div>
      </section>

      {/* Recent Contributions */}
      <section className="w-full max-w-7xl px-4 pb-20">
        <GlassCard className="max-w-3xl mx-auto border-t-4 border-t-amber-500 bg-white/90 dark:bg-slate-950/55">
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center text-slate-900 dark:text-slate-50">Recent Devotees</h3>
          <div className="space-y-4">
            {recentContributions.map((contribution, index) => (
              <div
                key={contribution.id}
                className="flex justify-between items-center p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-amber-400/60 transition-colors dark:bg-white/5 dark:border-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-500/20 dark:to-amber-600/20 flex items-center justify-center text-amber-800 dark:text-amber-200 font-semibold">
                    {settings.showNamesPublicly ? (contribution?.name?.charAt?.(0) || '?') : '?'}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{settings.showNamesPublicly ? (contribution?.name || 'Anonymous') : 'Anonymous Devotee'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{contribution.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900 dark:text-white">{settings.showAmountsPublicly ? `₹${contribution.amount}` : '✓ Contributed'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Contributed</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/contributors" className="w-full sm:w-auto inline-block">
              <Button variant="outline" className="w-full sm:w-auto px-6 py-3 border-slate-300 text-slate-800 hover:bg-slate-100 dark:border-white/15 dark:text-slate-100 dark:hover:bg-white/5">View All Contributions</Button>
            </Link>
          </div>
        </GlassCard>
      </section>

      {/* Community Suggestions Preview */}
      <section className="w-full max-w-7xl px-4 pb-32">
        <div className="mb-10 px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Community Voice
              </h2>
              <p className={sectionSubtitleClass}>See what others are suggesting for the festival.</p>
            </div>
            <Link href="/suggestions" className="w-full md:w-auto">
              <Button className="w-full md:w-auto bg-slate-950 text-white hover:bg-slate-800 font-semibold px-6 py-3 rounded-2xl shadow-lg shadow-slate-950/15 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]">
                View All & Submit
              </Button>
            </Link>
          </div>
        </div>

        {suggestions.length === 0 ? (
          <div className="text-center py-12 p-6 border border-dashed border-slate-300 rounded-xl opacity-80 dark:border-white/10">
            <MessageSquarePlus className="h-12 w-12 mx-auto mb-3 text-slate-400 dark:text-slate-500" />
            <h3 className="text-lg font-medium">No suggestions yet!</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">Be the first to share your ideas with us.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.slice(0, 6).map((suggestion) => (
              <GlassCard key={suggestion.id} className="p-6 flex flex-col h-full hover:border-amber-400/30 transition-colors bg-white/90 dark:bg-slate-950/55">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-semibold">
                    {suggestion?.name?.charAt?.(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{suggestion?.name || 'Anonymous'}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {suggestion.created_at ? new Date(suggestion.created_at).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </div>
                
                <p className="text-slate-700 dark:text-slate-300 flex-1 mb-4 line-clamp-3">
                  {suggestion.suggestion}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleVote(suggestion.id, 'up')}
                      disabled={votedItems[suggestion.id] === 'up'}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                        votedItems[suggestion.id] === 'up' 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                            : 'hover:bg-green-50 dark:hover:bg-green-900/20 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <ThumbsUp size={16} />
                      <span className="font-bold text-sm">{suggestion.likes}</span>
                    </button>
                    <button 
                      onClick={() => handleVote(suggestion.id, 'down')}
                      disabled={votedItems[suggestion.id] === 'down'}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                        votedItems[suggestion.id] === 'down' 
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                            : 'hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <ThumbsDown size={16} />
                      <span className="font-bold text-sm">{suggestion.dislikes}</span>
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </section>

      {/* Contact Section */}
      <section className="w-full max-w-7xl px-4 pb-20 overflow-hidden">
        <div
        >
          <GlassCard className="border-t-4 border-t-amber-500 shadow-2xl relative overflow-hidden bg-white/90 dark:bg-slate-950/55">
            
            <h3 className="text-3xl md:text-4xl font-bold mb-10 text-center text-slate-900 dark:text-slate-50">
              Get In Touch
            </h3>
            
            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[
                { 
                  name: "Chetan", 
                  value: "+91 8183859491", 
                  href: "tel:+918183859491", 
                  icon: Phone, 
                  color: "from-green-500 to-emerald-600",
                  bgHover: "hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30",
                  border: "border-green-200 dark:border-green-800",
                  text: "text-green-700 dark:text-green-400"
                },
                { 
                  name: "Prajwal", 
                  value: "+91 9380753581", 
                  href: "tel:+919380753581", 
                  icon: Phone, 
                  color: "from-green-500 to-emerald-600",
                  bgHover: "hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30",
                  border: "border-green-200 dark:border-green-800",
                  text: "text-green-700 dark:text-green-400"
                },
                { 
                  name: "YouTube", 
                  value: "@EkadanthaBoysGMP", 
                  href: "https://www.youtube.com/@EkadanthaBoysGMP", 
                  icon: YoutubeIcon, 
                  color: "from-red-500 to-rose-600",
                  bgHover: "hover:from-red-100 hover:to-rose-100 dark:hover:from-red-900/30 dark:hover:to-rose-900/30",
                  border: "border-red-200 dark:border-red-800",
                  text: "text-red-700 dark:text-red-400"
                },
                { 
                  name: "Instagram", 
                  value: "@teamegb_official", 
                  href: "https://www.instagram.com/teamegb_official/", 
                  icon: InstagramIcon, 
                  color: "from-pink-500 to-purple-600",
                  bgHover: "hover:from-pink-100 hover:to-purple-100 dark:hover:from-pink-900/30 dark:hover:to-purple-900/30",
                  border: "border-pink-200 dark:border-pink-800",
                  text: "text-pink-700 dark:text-pink-400"
                },
                { 
                  name: "Email", 
                  value: "ekadantaboysgmp@gmail.com", 
                  href: "mailto:ekadantaboysgmp@gmail.com", 
                  icon: Mail, 
                  color: "from-blue-500 to-indigo-600",
                  bgHover: "hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30",
                  border: "border-blue-200 dark:border-blue-800",
                  text: "text-blue-700 dark:text-blue-400"
                }
              ].map((contact, index) => (
                <a 
                  key={index}
                  href={contact.href} 
                  target={contact.href.startsWith("http") ? "_blank" : undefined}
                  rel={contact.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 group border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-xl relative z-10 bg-white/80 dark:bg-white/5 backdrop-blur-sm hover:scale-[1.01] active:scale-[0.98]"
                >
                  <div className={`p-4 bg-gradient-to-br ${contact.color} rounded-2xl shadow-lg shadow-black/10 group-hover:scale-[1.02] transition-all duration-300`}>
                    <contact.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-[0.2em] mb-1">{contact.name}</p>
                    <p className={`font-semibold ${contact.text} truncate text-lg`}>{contact.value}</p>
                  </div>
                </a>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Media Lightbox Modal */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div 
            className="relative max-w-5xl w-full max-h-[90vh] rounded-2xl overflow-hidden bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
            >
              ✕
            </button>
            
            {selectedMedia.type === 'video' ? (
              <div className="w-full aspect-video">
                {isYouTubeUrl(selectedMedia.url) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeId(selectedMedia.url)}?autoplay=1`}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  <video 
                    src={selectedMedia.url} 
                    controls 
                    autoPlay 
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            ) : (
              <div className="relative w-full h-[70vh] md:h-[80vh]">
                <img 
                  src={selectedMedia.url} 
                  alt={selectedMedia.caption}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            
            <div className="p-4 bg-gradient-to-t from-black to-transparent">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-orange-600 text-white text-xs font-black uppercase tracking-widest">{selectedMedia.year}</span>
                {selectedMedia.type === 'video' && <span className="text-white/60"><Video size={14} /></span>}
              </div>
              <h3 className="text-white text-xl font-bold">{selectedMedia.caption}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

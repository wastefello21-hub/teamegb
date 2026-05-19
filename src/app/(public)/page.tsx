"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Users, TrendingUp, Heart, Wallet, Play, Video, MessageSquarePlus, ThumbsUp, ThumbsDown, Phone, Mail, X, Image as ImageIcon } from 'lucide-react';
import { YoutubeIcon, InstagramIcon } from '@/components/ui/SocialIcons';
import Link from 'next/link';
import { useData, Photo } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { extractVideoThumbnail } from '@/lib/videoThumbnail';
import { AnimatePresence, motion } from 'framer-motion';

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
  const [isLogoViewerOpen, setIsLogoViewerOpen] = useState(false);

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

  useEffect(() => {
    setRevealedCount(showcaseItems.length > 0 ? 1 : 0);
  }, [showcaseKey, showcaseItems.length]);

  useEffect(() => {
    if (revealedCount === 0 || revealedCount >= showcaseItems.length) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRevealedCount(prev => Math.min(prev + 1, showcaseItems.length));
    }, revealedCount === 1 ? 140 : 220);

    return () => window.clearTimeout(timeoutId);
  }, [revealedCount, showcaseItems.length]);

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

  return (
    <div className="flex flex-col items-center w-full scroll-smooth">
      {/* Hero Section */}
      <section className="relative w-full min-h-[92vh] flex flex-col items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 z-[-1]">
          <Image 
            src="/logo_v2.jpg" 
            alt="Festival Background" 
            fill
            className="object-cover opacity-60 md:opacity-70 scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/35 via-background/10 to-background" />
        </div>

        <div 
          className="text-center px-6 md:px-12 max-w-5xl z-10 py-12 rounded-[2rem] bg-black/10 backdrop-blur-md border border-white/10 shadow-2xl shadow-black/20 glass-hover"
        >
          {/* Interactive Logo Section */}
          <div className="flex justify-center mb-6">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsLogoViewerOpen(true)}
              className="focus:outline-none group relative"
              type="button"
              aria-label="View festival logo"
            >
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-yellow-400 shadow-2xl shadow-yellow-500/30 transition-all duration-300 group-hover:shadow-3xl group-hover:shadow-yellow-500/50">
              <Image
                src="/logo_v2.jpg"
                alt="TEAM EGB Logo"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                priority
              />
            </div>
          </motion.button>
          </div>

          <div
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/15 dark:bg-white/10 border border-white/15 text-xs md:text-sm font-bold uppercase tracking-[0.28em] text-white/90 backdrop-blur-md"
          >
            Ganesha Chaturthi Celebration
          </div>
          <h1
            className="text-5xl md:text-8xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-orange-600 [filter:drop-shadow(0_4px_8px_rgba(0,0,0,0.5))] tracking-tight leading-tight"
          >
            {settings?.festivalName?.includes('-') ? settings.festivalName.split('-')[0].trim() : (settings?.festivalName || 'TEAM EGB')}
            <br />
            <span
              className="text-4xl md:text-6xl text-white dark:text-yellow-400 font-bold block mt-2 [text-shadow:0_2px_10px_rgba(0,0,0,0.5)] opacity-95"
            >
              {settings?.festivalName?.includes('-') ? settings.festivalName.split('-')[1].trim() : 'Ganesha Chaturthi Celebrations'}
            </span>
          </h1>
          
          <p
            className="text-xl md:text-2xl font-bold mb-12 text-foreground dark:text-white max-w-2xl mx-auto italic [text-shadow:0_2px_4px_rgba(0,0,0,0.3)]"
          >
            "Celebrating Devotion, Faith, and Youth Unity"
          </p>
          
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-4"
          >
            <Link href="#contributions" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full text-lg px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25 border-0 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] font-semibold"
              >
                View Contributions
              </Button>
            </Link>
            <Link href="/gallery" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full text-lg px-8 py-4 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25 border-0 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] font-semibold text-white"
              >
                View Gallery
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Logo Viewer Modal */}
      <AnimatePresence>
        {isLogoViewerOpen && (
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
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-yellow-400/20 via-orange-300/10 to-transparent blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/90 dark:bg-neutral-950/90 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
                <button
                  type="button"
                  onClick={() => setIsLogoViewerOpen(false)}
                  className="absolute right-3 top-3 z-10 rounded-full bg-black/55 p-2 text-white backdrop-blur-md transition-transform hover:scale-105"
                  aria-label="Close logo preview"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="relative aspect-square w-full bg-gradient-to-br from-yellow-100 via-white to-orange-50 dark:from-neutral-900 dark:via-neutral-950 dark:to-black">
                  <Image
                    src="/logo_v2.jpg"
                    alt="TEAM EGB logo enlarged"
                    fill
                    sizes="(max-width: 640px) 90vw, 560px"
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="px-6 py-8 text-center">
                  <h2 className="text-3xl md:text-4xl font-black text-foreground">
                    Team EGB
                  </h2>
                  <p className="mt-3 text-base font-semibold text-foreground/70">
                    Ganesha Chaturthi Celebrations
                  </p>
                  <p className="mt-4 text-sm text-foreground/60">
                    Tap outside or press Escape to close
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analytics Dashboard */}
      <section className="section-shell w-full px-4 py-20" id="contributions">
        <div
          className="text-center mb-12"
        >
          <h2
            className="section-title text-3xl md:text-4xl font-bold mb-4 glow-text text-orange-600 dark:text-orange-400"
          >
            Transparency Matters
          </h2>
          <p
            className="text-foreground/70 max-w-2xl mx-auto"
          >
            We believe in complete transparency. Every rupee contributed by you is accounted for and utilized for the divine celebration.
          </p>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div
          >
            <Link href="/analytics" className="block group">
              <GlassCard variant="interactive" glow className="relative overflow-hidden group h-full">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/20 rounded-full blur-xl group-hover:bg-orange-500/40 transition-all duration-300" />
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-lg"
                  >
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground/80 group-hover:text-orange-500 transition-colors">Total Collection</h3>
                </div>
                <p
                  className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600"
                >
                  {analytics.totalContributions}
                </p>
              </GlassCard>
            </Link>
          </div>

          <div
          >
            <Link href="/contributors" className="block group">
              <GlassCard variant="interactive" glow className="relative overflow-hidden group h-full">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/40 transition-all duration-300" />
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg"
                  >
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground/80 group-hover:text-blue-500 transition-colors">Contributors</h3>
                </div>
                <p
                  className="text-3xl font-bold text-blue-600 dark:text-blue-400"
                >
                  {analytics.contributors}
                </p>
              </GlassCard>
            </Link>
          </div>

          <div
          >
            <Link href="/expenditure" className="block group">
              <GlassCard variant="interactive" glow className="relative overflow-hidden group h-full">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/20 rounded-full blur-xl group-hover:bg-red-500/40 transition-all duration-300" />
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="p-3 bg-gradient-to-br from-red-400 to-red-600 rounded-xl shadow-lg"
                  >
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground/80 group-hover:text-red-500 transition-colors">Expenditure</h3>
                </div>
                <p
                  className="text-3xl font-bold text-red-600 dark:text-red-400"
                >
                  {analytics.expenditure}
                </p>
              </GlassCard>
            </Link>
          </div>

          <div
          >
            <GlassCard variant="elevated" className="relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/20 rounded-full blur-xl group-hover:bg-green-500/30 transition-all duration-300" />
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg"
                >
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground/80">Balance</h3>
              </div>
              <p
                className="text-3xl font-bold text-green-600 dark:text-green-400"
              >
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
                className="section-title text-3xl font-black glow-text text-orange-600 dark:text-orange-400 leading-tight"
              >
                Glimpses of Devotion
              </h2>
              <p
                className="mt-2 text-foreground/70 text-sm md:text-base max-w-2xl mx-auto"
              >
                Beautiful moments captured during our celebrations.
              </p>
            </div>
            <div
            >
              <Link href="/gallery" className="w-full md:w-auto md:ml-8">
                <Button className="w-full md:w-auto bg-gradient-to-r from-orange-500 via-red-500 to-red-600 hover:from-orange-600 hover:via-red-600 hover:to-red-700 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg shadow-orange-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
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
        <GlassCard className="max-w-3xl mx-auto border-t-4 border-t-orange-500">
          <h3 className="text-2xl font-bold mb-6 text-center">Recent Devotees</h3>
          <div className="space-y-4">
            {recentContributions.map((contribution, index) => (
              <div
                key={contribution.id}
                className="flex justify-between items-center p-4 rounded-xl bg-background/50 border border-border-color hover:border-orange-500/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-200 to-red-200 dark:from-orange-900 dark:to-red-900 flex items-center justify-center text-orange-800 dark:text-orange-200 font-bold">
                    {settings.showNamesPublicly ? (contribution?.name?.charAt?.(0) || '?') : '?'}
                  </div>
                  <div>
                    <p className="font-semibold">{settings.showNamesPublicly ? (contribution?.name || 'Anonymous') : 'Anonymous Devotee'}</p>
                    <p className="text-xs text-foreground/50">{contribution.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-600 dark:text-orange-400">{settings.showAmountsPublicly ? `₹${contribution.amount}` : '✓ Contributed'}</p>
                  <p className="text-xs text-foreground/50">Contributed</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/contributors" className="w-full sm:w-auto inline-block">
              <Button variant="outline" className="w-full sm:w-auto px-6 py-3">View All Contributions</Button>
            </Link>
          </div>
        </GlassCard>
      </section>

      {/* Community Suggestions Preview */}
      <section className="w-full max-w-7xl px-4 pb-32">
        <div className="mb-10 px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black glow-text text-orange-600 dark:text-orange-400">
                Community Voice
              </h2>
              <p className="text-foreground/70">See what others are suggesting for the festival.</p>
            </div>
            <Link href="/suggestions" className="w-full md:w-auto">
              <Button className="w-full md:w-auto bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 hover:from-purple-600 hover:via-fuchsia-600 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                View All & Submit
              </Button>
            </Link>
          </div>
        </div>

        {suggestions.length === 0 ? (
          <div className="text-center py-12 p-6 border border-dashed border-border-color rounded-xl opacity-70">
            <MessageSquarePlus className="h-12 w-12 mx-auto mb-3 text-foreground/30" />
            <h3 className="text-lg font-medium">No suggestions yet!</h3>
            <p className="text-sm">Be the first to share your ideas with us.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.slice(0, 6).map((suggestion) => (
              <GlassCard key={suggestion.id} className="p-6 flex flex-col h-full hover:border-orange-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
                    {suggestion?.name?.charAt?.(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{suggestion?.name || 'Anonymous'}</h3>
                    <p className="text-xs text-foreground/50">
                      {suggestion.created_at ? new Date(suggestion.created_at).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </div>
                
                <p className="text-foreground/80 flex-1 mb-4 line-clamp-3">
                  {suggestion.suggestion}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border-color">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleVote(suggestion.id, 'up')}
                      disabled={votedItems[suggestion.id] === 'up'}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                        votedItems[suggestion.id] === 'up' 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                          : 'hover:bg-green-50 dark:hover:bg-green-900/20 text-foreground/60'
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
                          : 'hover:bg-red-50 dark:hover:bg-red-900/20 text-foreground/60'
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
          <GlassCard className="border-t-4 border-t-orange-500 shadow-2xl relative overflow-hidden">
            {/* Background elements for cool effect */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] -z-10" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10" />
            
            <h3 className="text-3xl font-black mb-10 text-center glow-text text-orange-600 dark:text-orange-400">
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
                  value: "@ekadanta_boys_gmp", 
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
                  className={`flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r ${contact.bgHover} transition-all duration-300 group border ${contact.border} shadow-sm hover:shadow-xl relative z-10 bg-background/50 dark:bg-background/20 backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98]`}
                >
                  <div className={`p-4 bg-gradient-to-br ${contact.color} rounded-2xl shadow-lg shadow-black/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <contact.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground/60 font-medium uppercase tracking-wider mb-1">{contact.name}</p>
                    <p className={`font-black ${contact.text} truncate text-lg`}>{contact.value}</p>
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

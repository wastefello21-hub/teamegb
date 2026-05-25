"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { Heart, Sparkles, Users, Flame, Landmark, Award } from 'lucide-react';

// Custom hook for typing effect
function useTypingEffect(text: string, speed: number = 80, startDelay: number = 500) {
  const [displayedText, setDisplayedText] = useState('');
  const [startTyping, setStartTyping] = useState(false);

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      setStartTyping(true);
    }, startDelay);

    return () => clearTimeout(delayTimer);
  }, [startDelay]);

  useEffect(() => {
    if (!startTyping) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayedText(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, startTyping]);

  return displayedText;
}

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, type: "spring" as const, bounce: 0.4 } }
  };

  // Typing effect for main heading
  const headingText = useTypingEffect("Team EGB", 120, 300);
  const subheadingText = useTypingEffect("Celebrating Devotion, Unity, and Culture", 50, 1200);

  return (
    <div className="flex w-full min-h-screen flex-col items-center overflow-hidden px-4 pb-20 pt-28 relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_22%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.08),transparent_20%)] -z-10" />
      <div className="absolute top-20 left-0 h-[500px] w-[500px] rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/10 blur-[120px] -z-10" />
      <div className="absolute bottom-20 right-0 h-[400px] w-[400px] rounded-full bg-gradient-to-r from-slate-400/10 to-amber-500/10 blur-[100px] -z-10" />
      <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-amber-500/10 blur-[80px] -z-10" />
      <div className="absolute top-1/2 left-1/3 h-80 w-80 rounded-full bg-sky-500/10 blur-[90px] -z-10" />
      
      {/* Floating Ganesha icons */}
      <motion.div 
        className="absolute top-32 right-10 text-amber-500/20"
        animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Landmark className="mx-auto mb-4 h-16 w-16 text-amber-500/50" />
      </motion.div>
      <motion.div 
        className="absolute bottom-40 left-10 text-slate-400/20"
        animate={{ y: [0, 15, 0], rotate: [0, -5, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <Flame size={40} />
      </motion.div>

      {/* Enhanced Hero Section */}
      <motion.div 
        className="section-shell mb-16 w-full text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.span 
          className="section-kicker mb-6"
          whileHover={{ scale: 1.08, translateY: -2 }}
        >
          Established with Devotion
        </motion.span>
        
        <h1 className="text-5xl md:text-8xl font-black mb-8 relative">
          <span className="absolute -inset-3 rounded-xl bg-gradient-to-r from-amber-500 to-sky-500 opacity-20 blur-3xl"></span>
          <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-slate-950 via-amber-700 to-rose-600 dark:from-white dark:via-amber-300 dark:to-rose-300 drop-shadow-lg">
            {headingText}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.7, repeat: Infinity, repeatType: "reverse" }}
              className="ml-2 inline-block h-16 w-1 align-middle bg-gradient-to-b from-amber-500 to-rose-500 md:h-20"
            />
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto font-medium min-h-[2.5rem] mb-8">
          {subheadingText}
          {subheadingText === "Celebrating Devotion, Unity, and Culture" && (
            <motion.span 
              className="inline-block ml-3"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart className="h-8 w-8 fill-rose-500 text-rose-500" />
            </motion.span>
          )}
        </p>

        {/* Decorative line */}
        <motion.div 
          className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-transparent via-amber-500 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </motion.div>

      {/* Content Cards */}
      <motion.div 
        className="w-full section-shell max-w-4xl space-y-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
      >
        {/* English Content Card */}
        <motion.div variants={itemVariants}>
          <GlassCard className="surface-panel p-8 md:p-12 relative overflow-hidden border-t-4 border-t-amber-500 shadow-2xl transition-all duration-300 group glass-hover">
            <div className="absolute -right-8 -top-8 text-amber-500/10 group-hover:text-amber-500/20 transition-colors">
              <Users size={140} />
            </div>
            <div className="absolute -left-4 -bottom-4 h-32 w-32 rounded-full bg-gradient-to-r from-amber-500/20 to-transparent blur-2xl" />
            
            <div className="relative z-10">
              <h2 className="mb-8 flex items-center gap-4 text-3xl font-bold text-foreground/90 md:text-4xl">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-slate-950 to-amber-600 font-bold text-white shadow-lg">EN</span>
                <span>Our Essence</span>
              </h2>
              <p className="space-y-6 text-lg font-medium leading-relaxed text-foreground/80 md:text-xl">
                <span className="block">
                  Team EGB stands as a symbol of unwavering devotion, unity, and spirit. Every year, we come together with one heart and one belief to welcome Lord Ganesha with pure faith, joy, and dedication. What we create is more than a celebration—it is a powerful expression of culture, brotherhood, and divine connection.
                </span>
                <span className="block">
                  From the moment we welcome Bappa with happiness and energy, to the final day when we bid him farewell with the same joy through a grand procession, every moment reflects our true devotion. Through every prayer, every effort, and every celebration, we seek blessings, spread positivity, and strengthen the bond that defines us.
                </span>
                <span className="mt-8 block rounded-r-lg border-l-4 border-amber-500 bg-gradient-to-r from-amber-500/10 to-transparent py-4 pl-6 text-xl font-bold text-amber-700 dark:text-amber-300">
                  For Team EGB, Ganesh Chaturthi is not just a festival, it is our pride, our tradition, and our devotion brought to life.
                </span>
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Kannada Content Card */}
        <motion.div variants={itemVariants}>
          <GlassCard className="surface-panel p-8 md:p-12 relative overflow-hidden border-t-4 border-t-sky-500 shadow-2xl transition-all duration-300 group glass-hover">
            <div className="absolute -left-8 -bottom-8 -scale-x-100 text-sky-500/10 group-hover:text-sky-500/20 transition-colors">
              <Sparkles size={140} />
            </div>
            <div className="absolute -right-4 -bottom-4 h-32 w-32 rounded-full bg-gradient-to-l from-sky-500/20 to-transparent blur-2xl" />

            <div className="relative z-10">
              <h2 className="mb-8 flex items-center gap-4 text-3xl font-bold text-foreground/90 md:text-4xl">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-slate-950 to-sky-600 font-bold text-white shadow-lg">ಕ</span>
                <span>ನಮ್ಮ ಬಗ್ಗೆ</span>
              </h2>
              <p className="space-y-6 text-lg font-medium leading-relaxed text-foreground/80 md:text-xl">
                <span className="block">
                  TEAM EGB ಅಚಲ ಭಕ್ತಿ, ಏಕತೆ ಮತ್ತು ಉತ್ಸಾಹದ ಪ್ರತೀಕವಾಗಿದೆ. ಪ್ರತಿವರ್ಷ ನಾವು ಒಂದೇ ಮನಸ್ಸು ಮತ್ತು ನಂಬಿಕೆಯಿಂದ ಶ್ರೀ ಗಣೇಶನನ್ನು ಶುದ್ಧ ಭಕ್ತಿ, ಸಂತೋಷ ಮತ್ತು ಸಮರ್ಪಣೆಯಿಂದ ಸ್ವಾಗತಿಸುತ್ತೇವೆ. ನಮ್ಮದು ಕೇವಲ ಒಂದು ಹಬ್ಬವಲ್ಲ—ಇದು ಸಂಸ್ಕೃತಿ, ಸಹೋದರತ್ವ ಮತ್ತು ದೈವಿಕ ಸಂಪರ್ಕದ ಶಕ್ತಿಯುತ ಅಭಿವ್ಯಕ್ತಿ.
                </span>
                <span className="block">
                  ನಾವು ಹೇಗೆ ಸಂತೋಷದಿಂದ ಬಪ್ಪನನ್ನು ಸ್ವಾಗತಿಸುತ್ತೇವೋ, ಅದೇ ರೀತಿಯಲ್ಲಿ ಕೊನೆಯ ದಿನ ಅವನನ್ನು ಭವ್ಯ ಮೆರವಣಿಗೆಯೊಂದಿಗೆ ಅದೇ ಸಂತೋಷದಿಂದ ಬೀಳ್ಕೊಡುತ್ತೇವೆ. ಪ್ರತಿಯೊಂದು ಪೂಜೆ, ಪ್ರತಿಯೊಂದು ಪ್ರಯತ್ನ ಮತ್ತು ಪ್ರತಿಯೊಂದು ಸಂಭ್ರಮದ ಮೂಲಕ ನಾವು ಆಶೀರ್ವಾದಗಳನ್ನು ಪಡೆಯಲು, ಸಕಾರಾತ್ಮಕತೆಯನ್ನು ಹಂಚಲು ಮತ್ತು ನಮ್ಮ ಬಂಧವನ್ನು ಇನ್ನಷ್ಟು ಬಲಪಡಿಸುತ್ತೇವೆ.
                </span>
                <span className="mt-8 block rounded-r-lg border-l-4 border-sky-500 bg-gradient-to-r from-sky-500/10 to-transparent py-4 pl-6 text-xl font-bold text-sky-700 dark:text-sky-300">
                  TEAM EGBಗೆ ಗಣೇಶ ಚತುರ್ಥಿ ಕೇವಲ ಹಬ್ಬವಲ್ಲ, ಇದು ನಮ್ಮ ಗೌರವ, ನಮ್ಮ ಪರಂಪರೆ ಮತ್ತು ನಮ್ಮ ಭಕ್ತಿಯ ಜೀವಂತ ರೂಪವಾಗಿದೆ.
                </span>
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Developer Credit Card - Enhanced */}
        <motion.div variants={itemVariants}>
          <GlassCard className="surface-panel p-8 md:p-12 text-center relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-sky-500/10 to-rose-500/10 glass-hover border border-amber-500/20 transition-all duration-300">
            <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
              <div className="absolute top-0 left-1/2 h-1 w-64 -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-500 to-transparent blur-lg" />
            </div>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Award className="mx-auto mb-6 h-16 w-16 text-amber-500 drop-shadow-lg" />
            </motion.div>
            <h3 className="mb-4 bg-clip-text text-2xl font-black text-transparent bg-gradient-to-r from-slate-950 to-amber-600 dark:from-white dark:to-amber-300 md:text-3xl">
              Crafted with Excellence
            </h3>
            <p className="mb-2 text-lg font-semibold text-foreground/90 md:text-xl">
              This website is developed by
            </p>
            <p className="text-3xl font-black md:text-4xl">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-950 via-amber-700 to-rose-600 underline decoration-4 decoration-amber-500 dark:from-white dark:via-amber-300 dark:to-rose-300">
                EGB DEVELOPERS
              </span>
            </p>
            <p className="mt-6 font-medium text-foreground/70">Building digital experiences with precision and devotion.</p>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
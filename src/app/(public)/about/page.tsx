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
    <div className="flex flex-col items-center w-full min-h-screen pt-28 pb-20 px-4 relative overflow-hidden">
      {/* Enhanced Background decorations */}
      <div className="absolute top-20 left-0 w-[500px] h-[500px] bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-20 right-0 w-[400px] h-[400px] bg-gradient-to-r from-red-500/15 to-orange-500/15 rounded-full blur-[100px] -z-10" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-yellow-500/10 rounded-full blur-[80px] -z-10" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-orange-500/10 rounded-full blur-[90px] -z-10" />
      
      {/* Floating Ganesha icons */}
      <motion.div 
        className="absolute top-32 right-10 text-orange-500/20"
        animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Landmark className="w-16 h-16 mx-auto mb-4 text-orange-500/50" />
      </motion.div>
      <motion.div 
        className="absolute bottom-40 left-10 text-yellow-500/20"
        animate={{ y: [0, 15, 0], rotate: [0, -5, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <Flame size={40} />
      </motion.div>

      {/* Enhanced Hero Section */}
      <motion.div 
        className="w-full section-shell text-center mb-16"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.span 
          className="px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-sm font-bold uppercase tracking-widest mb-6 inline-block shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all"
          whileHover={{ scale: 1.08, translateY: -2 }}
        >
          ⚡ Established with Devotion
        </motion.span>
        
        <h1 className="text-5xl md:text-8xl font-black mb-8 relative">
          <span className="absolute -inset-3 bg-gradient-to-r from-orange-600 to-yellow-500 blur-3xl opacity-30 rounded-xl"></span>
          <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 dark:from-orange-400 dark:via-red-400 dark:to-yellow-300 drop-shadow-lg">
            {headingText}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.7, repeat: Infinity, repeatType: "reverse" }}
              className="inline-block w-1 h-16 md:h-20 bg-gradient-to-b from-orange-500 to-red-500 ml-2 align-middle"
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
              <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            </motion.span>
          )}
        </p>

        {/* Decorative line */}
        <motion.div 
          className="w-20 h-1 mx-auto bg-gradient-to-r from-transparent via-orange-500 to-transparent rounded-full"
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
          <GlassCard className="p-8 md:p-12 relative overflow-hidden border-t-4 border-t-orange-500 shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 group glass-hover">
            <div className="absolute -right-8 -top-8 text-orange-500/10 group-hover:text-orange-500/20 transition-colors">
              <Users size={140} />
            </div>
            <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-gradient-to-r from-orange-500/30 to-transparent rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground/90 flex items-center gap-4">
                <span className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center text-white font-bold shadow-lg">EN</span>
                <span>Our Essence</span>
              </h2>
              <p className="text-lg md:text-xl leading-relaxed text-foreground/80 font-medium space-y-6">
                <span className="block">
                  Team EGB stands as a symbol of unwavering devotion, unity, and spirit. Every year, we come together with one heart and one belief to welcome Lord Ganesha with pure faith, joy, and dedication. What we create is more than a celebration—it is a powerful expression of culture, brotherhood, and divine connection.
                </span>
                <span className="block">
                  From the moment we welcome Bappa with happiness and energy, to the final day when we bid him farewell with the same joy through a grand procession, every moment reflects our true devotion. Through every prayer, every effort, and every celebration, we seek blessings, spread positivity, and strengthen the bond that defines us.
                </span>
                <span className="font-bold text-orange-600 dark:text-orange-400 text-xl block mt-8 border-l-4 border-orange-500 pl-6 py-4 bg-gradient-to-r from-orange-500/15 to-transparent rounded-r-lg">
                  🔥 For Team EGB, Ganesh Chaturthi is not just a festival—it is our pride, our tradition, and our devotion brought to life.
                </span>
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Kannada Content Card */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-8 md:p-12 relative overflow-hidden border-t-4 border-t-yellow-500 shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 group glass-hover">
            <div className="absolute -left-8 -bottom-8 text-yellow-500/10 group-hover:text-yellow-500/20 transition-colors -scale-x-100">
              <Sparkles size={140} />
            </div>
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-gradient-to-l from-yellow-500/30 to-transparent rounded-full blur-2xl" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground/90 flex items-center gap-4">
                <span className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg">ಕ</span>
                <span>ನಮ್ಮ ಬಗ್ಗೆ</span>
              </h2>
              <p className="text-lg md:text-xl leading-relaxed text-foreground/80 font-medium space-y-6">
                <span className="block">
                  TEAM EGB ಅಚಲ ಭಕ್ತಿ, ಏಕತೆ ಮತ್ತು ಉತ್ಸಾಹದ ಪ್ರತೀಕವಾಗಿದೆ. ಪ್ರತಿವರ್ಷ ನಾವು ಒಂದೇ ಮನಸ್ಸು ಮತ್ತು ನಂಬಿಕೆಯಿಂದ ಶ್ರೀ ಗಣೇಶನನ್ನು ಶುದ್ಧ ಭಕ್ತಿ, ಸಂತೋಷ ಮತ್ತು ಸಮರ್ಪಣೆಯಿಂದ ಸ್ವಾಗತಿಸುತ್ತೇವೆ. ನಮ್ಮದು ಕೇವಲ ಒಂದು ಹಬ್ಬವಲ್ಲ—ಇದು ಸಂಸ್ಕೃತಿ, ಸಹೋದರತ್ವ ಮತ್ತು ದೈವಿಕ ಸಂಪರ್ಕದ ಶಕ್ತಿಯುತ ಅಭಿವ್ಯಕ್ತಿ.
                </span>
                <span className="block">
                  ನಾವು ಹೇಗೆ ಸಂತೋಷದಿಂದ ಬಪ್ಪನನ್ನು ಸ್ವಾಗತಿಸುತ್ತೇವೋ, ಅದೇ ರೀತಿಯಲ್ಲಿ ಕೊನೆಯ ದಿನ ಅವನನ್ನು ಭವ್ಯ ಮೆರವಣಿಗೆಯೊಂದಿಗೆ ಅದೇ ಸಂತೋಷದಿಂದ ಬೀಳ್ಕೊಡುತ್ತೇವೆ. ಪ್ರತಿಯೊಂದು ಪೂಜೆ, ಪ್ರತಿಯೊಂದು ಪ್ರಯತ್ನ ಮತ್ತು ಪ್ರತಿಯೊಂದು ಸಂಭ್ರಮದ ಮೂಲಕ ನಾವು ಆಶೀರ್ವಾದಗಳನ್ನು ಪಡೆಯಲು, ಸಕಾರಾತ್ಮಕತೆಯನ್ನು ಹಂಚಲು ಮತ್ತು ನಮ್ಮ ಬಂಧವನ್ನು ಇನ್ನಷ್ಟು ಬಲಪಡಿಸುತ್ತೇವೆ.
                </span>
                <span className="font-bold text-yellow-600 dark:text-yellow-400 text-xl block mt-8 border-l-4 border-yellow-500 pl-6 py-4 bg-gradient-to-r from-yellow-500/15 to-transparent rounded-r-lg">
                  ✨ TEAM EGBಗೆ ಗಣೇಶ ಚತುರ್ಥಿ ಕೇವಲ ಹಬ್ಬವಲ್ಲ—ಇದು ನಮ್ಮ ಗೌರವ, ನಮ್ಮ ಪರಂಪರೆ ಮತ್ತು ನಮ್ಮ ಭಕ್ತಿಯ ಜೀವಂತ ರೂಪವಾಗಿದೆ.
                </span>
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Developer Credit Card - Enhanced */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-8 md:p-12 text-center relative overflow-hidden bg-gradient-to-br from-orange-500/15 via-yellow-500/15 to-red-500/15 dark:from-orange-900/30 dark:via-yellow-900/30 dark:to-red-900/30 glass-hover border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
            <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent blur-lg" />
            </div>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Award className="w-16 h-16 mx-auto mb-6 text-orange-500 drop-shadow-lg" />
            </motion.div>
            <h3 className="text-2xl md:text-3xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-yellow-500">
              Crafted with Excellence
            </h3>
            <p className="text-lg md:text-xl font-semibold text-foreground/90 mb-2">
              This website is developed by
            </p>
            <p className="text-3xl md:text-4xl font-black">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 underline decoration-4 decoration-orange-500">
                EGB DEVELOPERS
              </span>
            </p>
            <p className="text-foreground/70 mt-6 font-medium">💻 Building Digital Experiences with Passion</p>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
}
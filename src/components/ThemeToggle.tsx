"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const activeTheme = resolvedTheme ?? theme;

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" className="w-10 h-10">
        <Sun className="h-5 w-5 opacity-20 animate-pulse" />
      </Button>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant="ghost"
        onClick={() => setTheme(activeTheme === "dark" ? "light" : "dark")}
        className="w-10 h-10 rounded-full glass hover:bg-orange-500/10 transition-all duration-300 relative overflow-hidden group"
        aria-label="Toggle theme"
      >
        {/* Background glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400/20 to-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <AnimatePresence mode="wait">
          {activeTheme === "dark" ? (
            <motion.div
              key="sun"
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10"
            >
              <Sun className="h-5 w-5 text-gold-400 animate-pulse-glow" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10"
            >
              <Moon className="h-5 w-5 text-maroon-800 animate-bounce-gentle" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sparkle particles on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-1 right-1 w-1 h-1 bg-orange-400 rounded-full animate-sparkle delay-100"></div>
          <div className="absolute bottom-1 left-1 w-0.5 h-0.5 bg-yellow-400 rounded-full animate-sparkle delay-300"></div>
        </div>
      </Button>
    </motion.div>
  );
}

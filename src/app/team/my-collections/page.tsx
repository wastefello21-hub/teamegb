"use client";

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useData } from '@/context/DataContext';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { formatINR } from '@/lib/money';

export default function MyCollectionsPage() {
  const { contributions } = useData();
  const { user } = useAuth();
  
  // Use the logged-in user id
  const myUserId = user?.teamMemberId || user?.uid;
  
  const myContributions = contributions.filter(c => c.collector === myUserId);
  const totalCollected = myContributions.reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400">My Entries</h2>
        <p className="text-sm text-foreground/60">History of your collected contributions</p>
      </div>

      <GlassCard className="p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20 text-center flex flex-col justify-center items-center gap-2">
        <h2 className="text-sm text-foreground/70 font-medium uppercase tracking-wider">Total Collected By You</h2>
        <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">
          {formatINR(totalCollected)}
        </div>
      </GlassCard>

      <div className="space-y-4 pb-10">
        {myContributions.length === 0 ? (
          <div className="text-center py-10 text-foreground/50">
            You haven't logged any contributions yet.
          </div>
        ) : (
          myContributions.map((contribution, index) => (
            <motion.div
              key={contribution.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard className="p-4 hover:border-orange-500/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold">{contribution.name}</h3>
                    <p className="text-xs text-foreground/50">{contribution.house}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600 dark:text-orange-400">{formatINR(contribution.amount)}</p>
                    <span className="text-[10px] uppercase tracking-wider text-foreground/40 bg-background/50 px-2 py-0.5 rounded">
                      {contribution.mode}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-border-color/50 text-xs text-foreground/50">
                  <span>{contribution.id}</span>
                  <span>{contribution.date}</span>
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useData } from '@/context/DataContext';

export default function AnalyticsPage() {
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [mounted, setMounted] = useState(false);
  const { contributions } = useData();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Process contributions into chart data
  const chartData = useMemo(() => {
    if (!contributions || contributions.length === 0) {
      return [];
    }

    // Group by date
    const grouped: Record<string, number> = {};
    
    contributions.forEach((contribution) => {
      const date = contribution.date ? new Date(contribution.date) : new Date();
      let key: string;
      
      if (view === 'daily') {
        // Group by actual date (YYYY-MM-DD format for sorting)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        key = `${year}-${month}-${day}`;
      } else if (view === 'weekly') {
        // Group by week (approximate)
        const weekNum = Math.ceil(date.getDate() / 7);
        key = `Week ${weekNum}`;
      } else {
        // Group by month
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        key = months[date.getMonth()];
      }
      
      grouped[key] = (grouped[key] || 0) + (contribution.amount || 0);
    });

    // Convert to array and sort
    const result = Object.entries(grouped).map(([name, amount]) => ({ name, amount }));
    
    // Sort based on view
    if (view === 'daily') {
      // Sort by date string (YYYY-MM-DD sorts correctly)
      result.sort((a, b) => a.name.localeCompare(b.name));
      // Format the date for display (e.g., "Sep 15")
      result.forEach(item => {
        const date = new Date(item.name);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        item.name = `${months[date.getMonth()]} ${date.getDate()}`;
      });
    } else if (view === 'weekly') {
      const weekOrder = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      result.sort((a, b) => weekOrder.indexOf(a.name) - weekOrder.indexOf(b.name));
    } else {
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      result.sort((a, b) => monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name));
    }

    return result;
  }, [contributions, view]);

  // Fallback data when no contributions
  const dailyData = [
    { name: 'No Data', amount: 0 },
  ];

  const weeklyData = [
    { name: 'Week 1', amount: 0 },
    { name: 'Week 2', amount: 0 },
    { name: 'Week 3', amount: 0 },
    { name: 'Week 4', amount: 0 },
  ];

  const monthlyData = [
    { name: 'Jan', amount: 0 },
    { name: 'Feb', amount: 0 },
    { name: 'Mar', amount: 0 },
    { name: 'Apr', amount: 0 },
  ];

  const getData = () => {
    if (chartData.length > 0) return chartData;
    
    switch (view) {
      case 'weekly': return weeklyData;
      case 'monthly': return monthlyData;
      default: return dailyData;
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 section-shell min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <span className="inline-flex items-center px-4 py-2 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-semibold uppercase tracking-[0.25em] mb-5 border border-amber-500/15">
          Live Overview
        </span>
        <h1 className="text-4xl md:text-5xl font-semibold text-slate-950 dark:text-slate-50 mb-4 section-title">Collection Analytics</h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Explore the trends of devotion and contribution towards the Ganesha Festival. Our transparent ledger updates in real-time.
        </p>
      </motion.div>

      <GlassCard className="p-4 md:p-8 relative overflow-hidden glass-hover border border-slate-200/80 bg-white/90 dark:bg-slate-950/55 dark:border-white/10">
        
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Contribution Trends</h2>
          
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200/80 dark:bg-white/5 dark:border-white/10">
            <button 
              onClick={() => setView('daily')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'daily' ? 'bg-slate-950 text-white shadow-md dark:bg-amber-400 dark:text-slate-950' : 'hover:bg-slate-100 dark:hover:bg-white/10'}`}
            >
              Daily
            </button>
            <button 
              onClick={() => setView('weekly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'weekly' ? 'bg-slate-950 text-white shadow-md dark:bg-amber-400 dark:text-slate-950' : 'hover:bg-slate-100 dark:hover:bg-white/10'}`}
            >
              Weekly
            </button>
            <button 
              onClick={() => setView('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'monthly' ? 'bg-slate-950 text-white shadow-md dark:bg-amber-400 dark:text-slate-950' : 'hover:bg-slate-100 dark:hover:bg-white/10'}`}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="h-[400px] w-full min-h-[320px]">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%" minHeight={320}>
              <BarChart data={getData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="currentColor" className="text-foreground/60 text-xs" />
                <YAxis stroke="currentColor" className="text-foreground/60 text-xs" tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,165,0,0.3)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#ffb74d' }}
                  formatter={(value: any) => [`₹${value}`, 'Collection']}
                />
                <Bar dataKey="amount" fill="url(#colorOrange)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full animate-pulse rounded-xl bg-foreground/5" />
          )}
        </div>
      </GlassCard>
    </div>
  );
}

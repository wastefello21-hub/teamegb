"use client";

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Wallet, Users, TrendingUp, IndianRupee } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { useData } from '@/context/DataContext';

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const { contributions, totalCollection, totalExpenditure, balance, teamMembers } = useData();

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatCurrency = (val: number) => `₹ ${val.toLocaleString('en-IN')}`;

  const stats = [
    { label: 'Total Collections', value: formatCurrency(totalCollection), icon: <IndianRupee className="w-5 h-5 text-green-500" /> },
    { label: 'Total Expenditures', value: formatCurrency(totalExpenditure), icon: <TrendingUp className="w-5 h-5 text-red-500" /> },
    { label: 'Net Balance', value: formatCurrency(balance), icon: <Wallet className="w-5 h-5 text-orange-500" /> },
    { label: 'Total Contributors', value: String(contributions.length), icon: <Users className="w-5 h-5 text-blue-500" /> },
  ];

  // Group contributions by date for the daily chart
  const dailyMap = new Map<string, number>();
  contributions.forEach(c => {
    const existing = dailyMap.get(c.date) || 0;
    dailyMap.set(c.date, existing + Number(c.amount));
  });
  const dailyData = Array.from(dailyMap.entries())
    .map(([name, amount]) => ({ name, amount }))
    .reverse()
    .slice(-7);

  // Dynamically calculate team performance from real Contribution data
  const colMap = new Map<string, number>();
  contributions.forEach(c => {
    if (c.collector) {
      const existing = colMap.get(c.collector) || 0;
      colMap.set(c.collector, existing + Number(c.amount));
    }
  });

  const teamPerformance = teamMembers.map(m => ({
    name: `${m.name.split(' ')[0]}`,
    collections: Number(colMap.get(m.id) || m.collections || 0)
  }));

  return (
    <div className="section-shell space-y-6">
      <div className="surface-panel rounded-[2rem] p-6 md:p-8">
        <span className="section-kicker mb-4">Management console</span>
        <h2 className="text-2xl font-semibold text-slate-950 dark:text-slate-50 md:text-3xl">Dashboard Overview</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">Welcome to the central management console.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <GlassCard
            key={i}
            className={`flex items-center gap-4 p-4 border shadow-sm ${i === 0 ? 'border-orange-200/70 bg-gradient-to-br from-white/95 to-orange-50/80 dark:from-slate-950/70 dark:to-orange-950/10 dark:border-orange-500/20' : i === 1 ? 'border-rose-200/70 bg-gradient-to-br from-white/95 to-rose-50/80 dark:from-slate-950/70 dark:to-rose-950/10 dark:border-rose-500/20' : i === 2 ? 'border-amber-200/70 bg-gradient-to-br from-white/95 to-amber-50/80 dark:from-slate-950/70 dark:to-amber-950/10 dark:border-amber-500/20' : 'border-sky-200/70 bg-gradient-to-br from-white/95 to-sky-50/80 dark:from-slate-950/70 dark:to-sky-950/10 dark:border-sky-500/20'}`}
          >
            <div className={`p-3 rounded-xl border ${i === 0 ? 'bg-orange-100 border-orange-200 dark:bg-orange-500/15 dark:border-orange-300/20' : i === 1 ? 'bg-rose-100 border-rose-200 dark:bg-rose-500/15 dark:border-rose-300/20' : i === 2 ? 'bg-amber-100 border-amber-200 dark:bg-amber-500/15 dark:border-amber-300/20' : 'bg-sky-100 border-sky-200 dark:bg-sky-500/15 dark:border-sky-300/20'}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{stat.label}</p>
              <p className="text-xl font-semibold text-slate-950 dark:text-slate-50">{stat.value}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Daily Collections Chart */}
        <GlassCard className="h-96 flex flex-col border border-orange-200/70 bg-gradient-to-br from-white/95 to-orange-50/80 dark:from-slate-950/70 dark:to-orange-950/10 dark:border-orange-500/20">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">Collections by Date</h3>
          <div className="flex-1 w-full min-h-0">
            {mounted && dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={260}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(249,115,22,0.15)" opacity={1} />
                  <XAxis dataKey="name" stroke="currentColor" fontSize={11} className="text-foreground/60" />
                  <YAxis stroke="currentColor" fontSize={12} className="text-foreground/60" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15,23,42,0.92)', borderRadius: '12px', border: '1px solid rgba(251,191,36,0.18)', color: '#fff' }}
                    itemStyle={{ color: '#fbbf24' }}
                    formatter={(value: any) => [`₹${value?.toLocaleString?.('en-IN') || value}`, 'Amount']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#f97316" 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : !mounted ? (
              <div className="h-full w-full animate-pulse rounded-xl bg-foreground/5" />
            ) : (
              <div className="flex items-center justify-center h-full text-foreground/40">No contribution data yet</div>
            )}
          </div>
        </GlassCard>

        {/* Team Performance Chart */}
        <GlassCard className="h-96 flex flex-col border border-rose-200/70 bg-gradient-to-br from-white/95 to-rose-50/80 dark:from-slate-950/70 dark:to-rose-950/10 dark:border-rose-500/20">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">Team Performance</h3>
          <div className="flex-1 w-full min-h-0">
            {mounted && teamPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={260}>
                <BarChart data={teamPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(244,63,94,0.12)" opacity={1} />
                  <XAxis dataKey="name" stroke="currentColor" fontSize={11} className="text-foreground/60" />
                  <YAxis stroke="currentColor" fontSize={12} className="text-foreground/60" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15,23,42,0.92)', borderRadius: '12px', border: '1px solid rgba(251,191,36,0.18)', color: '#fff' }}
                    cursor={{ fill: 'rgba(249,115,22,0.12)' }}
                    formatter={(value: any) => [`₹${value?.toLocaleString?.('en-IN') || value}`, 'Collections']}
                  />
                  <Bar 
                    dataKey="collections" 
                    fill="url(#colorOrange)" 
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fb923c" stopOpacity={0.95}/>
                      <stop offset="55%" stopColor="#f59e0b" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0.92}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : !mounted ? (
              <div className="h-full w-full animate-pulse rounded-xl bg-foreground/5" />
            ) : (
              <div className="flex items-center justify-center h-full text-foreground/40">No team data yet</div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">Dashboard Overview</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Welcome to the central management console.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <GlassCard key={i} className="flex items-center gap-4 p-4 border border-slate-200/80 bg-white/90 dark:bg-slate-950/55 dark:border-white/10">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 dark:bg-white/5 dark:border-white/10">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
              <p className="text-xl font-semibold text-slate-950 dark:text-slate-50">{stat.value}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Daily Collections Chart */}
        <GlassCard className="h-96 flex flex-col border border-slate-200/80 bg-white/90 dark:bg-slate-950/55 dark:border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">Collections by Date</h3>
          <div className="flex-1 w-full min-h-0">
            {mounted && dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={260}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#888" fontSize={11} />
                  <YAxis stroke="#888" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderRadius: '8px', border: 'none' }}
                    itemStyle={{ color: '#f47f16' }}
                    formatter={(value: any) => [`₹${value?.toLocaleString?.('en-IN') || value}`, 'Amount']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#f47f16" 
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
        <GlassCard className="h-96 flex flex-col border border-slate-200/80 bg-white/90 dark:bg-slate-950/55 dark:border-white/10">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">Team Performance</h3>
          <div className="flex-1 w-full min-h-0">
            {mounted && teamPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={260}>
                <BarChart data={teamPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#888" fontSize={11} />
                  <YAxis stroke="#888" fontSize={12} />
                                    <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderRadius: '8px', border: 'none' }}
                    cursor={{ fill: 'rgba(244, 127, 22, 0.1)' }}
                    formatter={(value: any) => [`₹${value?.toLocaleString?.('en-IN') || value}`, 'Collections']}
                  />
                  <Bar 
                    dataKey="collections" 
                    fill="url(#colorOrange)" 
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f47f16" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#d32f2f" stopOpacity={0.8}/>
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

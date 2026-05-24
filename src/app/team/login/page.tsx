"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext'; // Import Auth

export default function TeamLogin() {
  const [teamId, setTeamId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { teamMembers } = useData();
  const { login, user, clearStatusMessage } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/team/dashboard');
    }
  }, [user, router]);

  const goBack = () => {
    if (typeof window !== 'undefined' && (window.history.length > 1 || document.referrer.startsWith(window.location.origin))) {
      router.back();
      return;
    }

    router.push('/');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    clearStatusMessage(); // Clear any existing status messages
    setIsLoading(true);
    
    // Validate against global context
    setTimeout(async () => {
      setIsLoading(false);
      const normalizedTeamId = teamId.trim().toLowerCase();
      const normalizedPassword = password.trim();
      
      const member = teamMembers.find(m => m.id.trim().toLowerCase() === normalizedTeamId);
      
      if (member) {
        // Check if member is disabled
        if (member.is_enabled === false) {
          setError('Your account has been disabled. Please contact the admin for support.');
          return;
        }
        
        // If they have a custom password use it, else default to password123
        const expectedPassword = (member.password || 'password123').trim();
        
        if (normalizedPassword === expectedPassword) {
          await login(member.id, member.role === 'Team Lead' ? 'admin' : 'team', member.name);
          router.push('/team/dashboard');
        } else {
          setError('Invalid Password.');
        }
      } else {
        setError('Invalid Team ID.');
      }
    }, 1000);
  };

  return (
    <GlassCard className="w-full max-w-md border-t-4 border-t-orange-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-600 text-white shadow-lg mb-4 text-3xl">
          ॐ
        </div>
        <h2 className="text-2xl font-bold">Team Access</h2>
        <p className="text-foreground/60 text-sm mt-1">Enter your credentials to continue</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-sm rounded-lg border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Team Member ID</label>
          <input 
            type="text" 
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-background border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            placeholder="e.g. EGB-001"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-background border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            placeholder="••••••••"
            required
          />
        </div>
        <Button 
          type="submit" 
          className="w-full py-3 mt-4 text-lg" 
          disabled={isLoading}
        >
          {isLoading ? 'Verifying...' : 'Login to Portal'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-foreground/60">
        <button type="button" onClick={goBack} className="hover:text-orange-500 transition-colors">
          &larr; Back to Public Website
        </button>
      </div>
    </GlassCard>
  );
}

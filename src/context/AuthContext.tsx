"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role?: 'admin' | 'team';
  teamMemberId?: string;
  name?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isAdmin: boolean;
  isTeam: boolean;
  activeMembers: string[];
  statusMessage: string | null;
  clearStatusMessage: () => void;
  login: (teamMemberId: string, role: 'admin' | 'team', name: string) => void;
  logout: () => void;
  markAsOffline: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isTeam: false,
  activeMembers: [],
  statusMessage: null,
  clearStatusMessage: () => {},
  login: () => {},
  logout: () => {},
  markAsOffline: () => {},
});

export const AuthProvider = ({ children }: { children: any }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMembers, setActiveMembers] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const clearStatusMessage = () => setStatusMessage(null);

  // Fetch active members from Supabase on mount
  useEffect(() => {
    const fetchActiveMembers = async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('id')
        .eq('is_online', true);

      if (!error && data) {
        setActiveMembers(data.map(m => m.id));
      }
    };

    fetchActiveMembers();

    // Subscribe to real-time changes in team_members
    const channel = supabase
      .channel('team_members_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'team_members'
      }, async (payload) => {
        // Re-fetch active members when there's a change
        const { data } = await supabase
          .from('team_members')
          .select('id')
          .eq('is_online', true);
        
        if (data) {
          setActiveMembers(data.map(m => m.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // Look up who logged in from sessionStorage
    const storedUser = sessionStorage.getItem('egb_auth_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Default to nothing until logged in properly
      setUser(null);
    }

    setLoading(false);
  }, []);

  const login = async (teamMemberId: string, role: 'admin' | 'team', name: string) => {
    const newUser: AppUser = {
      uid: teamMemberId,
      email: `${teamMemberId}@egb`,
      displayName: name,
      role: role,
      teamMemberId: teamMemberId,
      name: name,
    };
    setUser(newUser);
    sessionStorage.setItem('egb_auth_user', JSON.stringify(newUser));
    setStatusMessage(null); // Clear any existing status messages

    // Add to active members and update Supabase
    setActiveMembers(prevActive => {
      if (prevActive.includes(teamMemberId)) return prevActive;
      const updatedActive = [...prevActive, teamMemberId];
      return updatedActive;
    });

    // Update Supabase to mark member as online
    await supabase
      .from('team_members')
      .update({ is_online: true, last_seen: new Date().toISOString() })
      .eq('id', teamMemberId);
  };

  const logout = async () => {
    const memberId = user?.teamMemberId;
    setUser(null);
    sessionStorage.removeItem('egb_auth_user');

    if (!memberId) return;

    setActiveMembers(prevActive => prevActive.filter(id => id !== memberId));

    // Update Supabase to mark member as offline
    await supabase
      .from('team_members')
      .update({ is_online: false, last_seen: new Date().toISOString() })
      .eq('id', memberId);

    setStatusMessage('Offline status saved successfully.');
  };

  // Function to mark member as offline when they navigate away or close the browser
  const markAsOffline = async () => {
    const memberId = user?.teamMemberId;
    if (!memberId) return;

    setActiveMembers(prevActive => prevActive.filter(id => id !== memberId));

    await supabase
      .from('team_members')
      .update({ is_online: false, last_seen: new Date().toISOString() })
      .eq('id', memberId);

    setStatusMessage('Offline status saved successfully.');
  };

  const isAdmin = user?.role === 'admin';
  const isTeam = user?.role === 'team' || isAdmin;

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isTeam, activeMembers, statusMessage, clearStatusMessage, login, logout, markAsOffline }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

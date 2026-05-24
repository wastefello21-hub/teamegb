"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

// Types
export type Contribution = {
  id?: string;
  name: string;
  house: string;
  phone: string;
  amount: number;
  mode: string;
  date: string;
  collector: string;
  receipt_number?: string;
  receipt_url?: string;
  receipt_created_at?: string;
};

export type Expenditure = {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
};

export type Photo = {
  id: string;
  year: string;
  url: string;
  caption: string;
  type: 'image' | 'video';
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  collections: number;
  status: string;
  password?: string;
  is_enabled?: boolean;
  is_online?: boolean;
  id_card_url?: string;
};

export type AppSettings = {
  showNamesPublicly: boolean;
  showAmountsPublicly: boolean;
  showExpenditurePublicly: boolean;
  festivalName: string;
};

export const defaultSettings: AppSettings = {
  showNamesPublicly: true,
  showAmountsPublicly: false,
  showExpenditurePublicly: true,
  festivalName: 'TEAM EGB - Ganesha Chaturthi Celebrations',
};

export type Suggestion = {
  id: string;
  name: string;
  phone: string;
  suggestion: string;
  likes: number;
  dislikes: number;
  created_at?: string;
};

export type SuggestionVote = {
  id: string;
  suggestion_id: string;
  user_id: string;
  vote_type: 'like' | 'dislike';
};

export type Event = {
  id: string;
  name: string;
  description: string;
  poster_url: string;
  date: string;
  time: string;
  venue: string;
  application_last_date?: string;
  is_registration_open?: boolean;
  created_at?: string;
};

export type EventApplication = {
  id: string;
  event_id: string;
  name: string;
  phone: string;
  age: number;
  activity: string;
  created_at?: string;
};

interface DataContextType {
  contributions: Contribution[];
  expenditures: Expenditure[];
  teamMembers: TeamMember[];
  gallery: Photo[];
  suggestions: Suggestion[];
  events: Event[];
  eventApplications: EventApplication[];
  userVotes: Record<string, 'like' | 'dislike'>;
  settings: AppSettings;
  
  // Actions
  addContribution: (contribution: Contribution) => Promise<Contribution | null>;
  deleteContribution: (id: string) => void;
  
  addExpenditure: (expenditure: Expenditure) => void;
  deleteExpenditure: (id: string) => void;
  
  addTeamMember: (member: TeamMember) => Promise<void> | void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;
  
  addPhoto: (photo: Photo) => void;
  deletePhoto: (id: string) => void;

  addSuggestion: (suggestion: Omit<Suggestion, 'id' | 'likes' | 'dislikes'>) => void;
  deleteSuggestion: (id: string) => void;
  voteSuggestion: (id: string, type: 'like' | 'dislike') => Promise<boolean>;
  
  addEvent: (event: Omit<Event, 'id' | 'created_at'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  applyForEvent: (application: Omit<EventApplication, 'id' | 'created_at'>) => Promise<void>;
  deleteEventApplication: (id: string) => Promise<void>;
  
  updateSettings: (updates: Partial<AppSettings>) => void;
  
  // Derived Data
  totalCollection: number;
  totalExpenditure: number;
  balance: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);

  // Initial Mock Data Fallbacks
  const defaultContributions: Contribution[] = [];

  const defaultExpenditures: Expenditure[] = [];

  const defaultTeam: TeamMember[] = [
    { id: 'EGB-01', name: 'Rahul Sharma', role: 'Team Lead', collections: 0, status: 'Active', password: 'password123' }
  ];

  const defaultGallery: Photo[] = [];
  const defaultSuggestions: Suggestion[] = [];

  const [contributions, setContributions] = useState<Contribution[]>(defaultContributions);
  const [expenditures, setExpenditures] = useState<Expenditure[]>(defaultExpenditures);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(defaultTeam);
  const [gallery, setGallery] = useState<Photo[]>(defaultGallery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(defaultSuggestions);
  const [userVotes, setUserVotes] = useState<Record<string, 'like' | 'dislike'>>({});
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventApplications, setEventApplications] = useState<EventApplication[]>([]);

  // Load from localStorage & Supabase on client side mount
  // Load from localStorage & Supabase on client side mount
  // Optimized: Batch API calls and add caching with improved performance
  useEffect(() => {
    setIsMounted(true);
    const initializeData = async () => {
      try {
        // Check cache first with shorter validity for faster updates on photo upload
        const cacheKey = 'egb_data_cache';
        const cacheTimestamp = 'egb_data_timestamp';
        const galleryCacheFreshUntil = 'egb_gallery_fresh_until';
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTime = localStorage.getItem(cacheTimestamp);
        const galleryFreshTime = localStorage.getItem(galleryCacheFreshUntil);
        
        // Reduced cache validity to 5 minutes for faster updates, gallery has special 2-minute handling
        const isGeneralCacheValid = cacheTime && (Date.now() - parseInt(cacheTime)) < 5 * 60 * 1000; // 5 minutes
        const isGalleryCacheFresh = galleryFreshTime && Date.now() < parseInt(galleryFreshTime);

        if (cachedData && isGeneralCacheValid) {
          const parsed = JSON.parse(cachedData);
          if (parsed.contributions) setContributions(parsed.contributions);
          if (parsed.teamMembers) setTeamMembers(parsed.teamMembers);
          // Only use cached gallery if it's still fresh (2 minutes)
          if (parsed.gallery && isGalleryCacheFresh) {
            setGallery(parsed.gallery);
          } else {
            // Force fresh gallery fetch if cache is stale
            parsed.gallery = null;
          }
          if (parsed.suggestions) setSuggestions(parsed.suggestions);
          if (parsed.events) setEvents(parsed.events);
          if (parsed.eventApplications) setEventApplications(parsed.eventApplications);
          if (parsed.settings) setSettings(parsed.settings);
          
          // If gallery cache is stale, fetch it fresh
          if (!parsed.gallery || !isGalleryCacheFresh) {
            const { data: freshGallery } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
            if (freshGallery) {
              setGallery(freshGallery);
              // Update cache with fresh gallery data
              parsed.gallery = freshGallery;
              try {
                localStorage.setItem(cacheKey, JSON.stringify(parsed));
                localStorage.setItem(galleryCacheFreshUntil, (Date.now() + 2 * 60 * 1000).toString()); // 2 minutes
              } catch (e) {
                console.warn('Failed to cache updated gallery:', e);
              }
            }
          }
          return;
        }

        // Fetch all data in parallel with Promise.allSettled for better error handling
        const [
          contributionsResult,
          teamMembersResult,
          galleryResult,
          suggestionsResult,
          userVotesResult,
          eventsResult,
          eventApplicationsResult,
          settingsResult
        ] = await Promise.allSettled([
          supabase.from('contributions').select('*').order('date', { ascending: false }),
          supabase.from('team_members').select('*'),
          supabase.from('gallery').select('*').order('created_at', { ascending: false }),
          supabase.from('suggestions').select('*').order('created_at', { ascending: false }),
          (async () => {
            const userId = localStorage.getItem('egb_user_id');
            if (!userId) return { data: null, error: null };
            return await supabase.from('suggestion_votes').select('*').eq('user_id', userId);
          })(),
          supabase.from('events').select('*').order('created_at', { ascending: false }),
          supabase.from('event_applications').select('*').order('created_at', { ascending: false }),
          supabase.from('app_settings').select('*').eq('id', 'default').single()
        ]);

        // Process results with early returns for better performance
        let hasNewData = false;
        if (contributionsResult.status === 'fulfilled' && !contributionsResult.value.error) {
          const newData = contributionsResult.value.data || [];
          setContributions(newData);
          hasNewData = true;
        }
        if (teamMembersResult.status === 'fulfilled' && !teamMembersResult.value.error) {
          const newData = teamMembersResult.value.data || [];
          setTeamMembers(newData);
          hasNewData = true;
        }
        if (galleryResult.status === 'fulfilled' && !galleryResult.value.error) {
          const newData = galleryResult.value.data || [];
          setGallery(newData);
          hasNewData = true;
        }
        if (suggestionsResult.status === 'fulfilled' && !suggestionsResult.value.error) {
          const newData = suggestionsResult.value.data || [];
          setSuggestions(newData);
          hasNewData = true;
        }
        if (userVotesResult.status === 'fulfilled' && !userVotesResult.value.error && userVotesResult.value.data) {
          const votesMap: Record<string, 'like' | 'dislike'> = {};
          userVotesResult.value.data.forEach((vote: any) => {
            votesMap[vote.suggestion_id] = vote.vote_type;
          });
          setUserVotes(votesMap);
        }
        if (eventsResult.status === 'fulfilled' && !eventsResult.value.error) {
          const newData = eventsResult.value.data || [];
          setEvents(newData);
          hasNewData = true;
        }
        if (eventApplicationsResult.status === 'fulfilled' && !eventApplicationsResult.value.error) {
          const newData = eventApplicationsResult.value.data || [];
          setEventApplications(newData);
          hasNewData = true;
        }
        if (settingsResult.status === 'fulfilled' && !settingsResult.value.error && settingsResult.value.data) {
          const newSettings = {
            showNamesPublicly: settingsResult.value.data.show_names_publicly,
            showAmountsPublicly: settingsResult.value.data.show_amounts_publicly,
            showExpenditurePublicly: settingsResult.value.data.show_expenditure_publicly,
            festivalName: settingsResult.value.data.festival_name
          };
          setSettings(newSettings);
          hasNewData = true;
        }

        // Cache only if we have new data
        if (hasNewData) {
          const dataToCache = {
            contributions: contributionsResult.status === 'fulfilled' ? contributionsResult.value.data : [],
            teamMembers: teamMembersResult.status === 'fulfilled' ? teamMembersResult.value.data : [],
            gallery: galleryResult.status === 'fulfilled' ? galleryResult.value.data : [],
            suggestions: suggestionsResult.status === 'fulfilled' ? suggestionsResult.value.data : [],
            events: eventsResult.status === 'fulfilled' ? eventsResult.value.data : [],
            eventApplications: eventApplicationsResult.status === 'fulfilled' ? eventApplicationsResult.value.data : [],
            settings: settingsResult.status === 'fulfilled' ? {
              showNamesPublicly: settingsResult.value.data?.show_names_publicly,
              showAmountsPublicly: settingsResult.value.data?.show_amounts_publicly,
              showExpenditurePublicly: settingsResult.value.data?.show_expenditure_publicly,
              festivalName: settingsResult.value.data?.festival_name
            } : defaultSettings
          };
          try {
            localStorage.setItem(cacheKey, JSON.stringify(dataToCache));
            localStorage.setItem(cacheTimestamp, Date.now().toString());
            // Set gallery cache freshness to 2 minutes
            localStorage.setItem('egb_gallery_fresh_until', (Date.now() + 2 * 60 * 1000).toString());
          } catch (e) {
            // Handle quota exceeded gracefully
            console.warn('Failed to cache data:', e);
          }
        }

      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initializeData();

    try {
      const storedExpenditures = localStorage.getItem('egb_expenditures');
      if (storedExpenditures) {
        const parsed = JSON.parse(storedExpenditures);
        if (Array.isArray(parsed)) setExpenditures(parsed);
      }

      const storedSettings = localStorage.getItem('egb_settings');
      if (storedSettings) {
        const parsedSetting = JSON.parse(storedSettings);
        if (parsedSetting && typeof parsedSetting === 'object') {
          setSettings(prev => ({ ...prev, ...parsedSetting }));
        }
      }
    } catch (e) {
      console.error("Error loading from localStorage", e);
    }

    const eventsSubscription = supabase
      .channel('events-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setEvents(prev => prev.map(e => e.id === payload.new.id ? payload.new as Event : e));
        } else if (payload.eventType === 'INSERT') {
          setEvents(prev => [payload.new as Event, ...prev]);
        } else if (payload.eventType === 'DELETE') {
          setEvents(prev => prev.filter(e => e.id !== payload.old.id));
        }
      })
      .subscribe();

    const teamMembersSubscription = supabase
      .channel('team_members-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setTeamMembers(prev => prev.map(member => member.id === payload.new.id ? payload.new as TeamMember : member));
        } else if (payload.eventType === 'INSERT') {
          setTeamMembers(prev => [payload.new as TeamMember, ...prev]);
        } else if (payload.eventType === 'DELETE') {
          setTeamMembers(prev => prev.filter(member => member.id !== payload.old.id));
        }
      })
      .subscribe();

    const gallerySubscription = supabase
      .channel('gallery-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setGallery(prev => prev.map(photo => photo.id === payload.new.id ? { id: payload.new.id, url: payload.new.url, year: payload.new.year, caption: payload.new.caption, type: payload.new.type } : photo));
        } else if (payload.eventType === 'INSERT') {
          const newPhoto: Photo = { id: payload.new.id, url: payload.new.url, year: payload.new.year, caption: payload.new.caption, type: payload.new.type };
          setGallery(prev => [newPhoto, ...prev]);
        } else if (payload.eventType === 'DELETE') {
          setGallery(prev => prev.filter(photo => photo.id !== payload.old.id));
        }
      })
      .subscribe();

    // Cross-tab synchronization
    const handleStorageChange = (e: StorageEvent) => {
      try {
        if (e.key === 'egb_contributions' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setContributions(parsed);
        }
        if (e.key === 'egb_expenditures' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setExpenditures(parsed);
        }
        if (e.key === 'egb_teamMembers' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setTeamMembers(parsed);
        }
        if (e.key === 'egb_gallery' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setGallery(parsed);
        }
        if (e.key === 'egb_suggestions' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setSuggestions(parsed);
        }
        if (e.key === 'egb_settings' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (parsed && typeof parsed === 'object') {
            setSettings(prev => ({ ...prev, ...parsed }));
          }
        }
      } catch (err) {}
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      eventsSubscription.unsubscribe();
      teamMembersSubscription.unsubscribe();
      gallerySubscription.unsubscribe();
    };
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('egb_contributions', JSON.stringify(contributions));
      } catch (e) {
        console.warn('Failed to save contributions to localStorage', e);
      }
    }
  }, [contributions, isMounted]);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('egb_expenditures', JSON.stringify(expenditures));
      } catch (e) {
        console.warn('Failed to save expenditures to localStorage', e);
      }
    }
  }, [expenditures, isMounted]);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('egb_teamMembers', JSON.stringify(teamMembers));
      } catch (e) {
        console.warn('Failed to save teamMembers to localStorage', e);
      }
    }
  }, [teamMembers, isMounted]);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('egb_gallery', JSON.stringify(gallery));
      } catch (e) {
        console.warn('Handling High Data: Quota Exceeded for gallery. Did not save to localStorage.', e);
      }
    }
  }, [gallery, isMounted]);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('egb_suggestions', JSON.stringify(suggestions));
      } catch (e) {
        console.warn('Failed to save suggestions to localStorage', e);
      }
    }
  }, [suggestions, isMounted]);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('egb_settings', JSON.stringify(settings));
      } catch (e) {
        console.warn('Failed to save settings to localStorage', e);
      }
    }
  }, [settings, isMounted]);

  // Derived Totals
  const totalCollection = contributions.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalExpenditure = expenditures.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const balance = totalCollection - totalExpenditure;

  // Actions
  const addContribution = async (contribution: Contribution) => {
    try {
      const response = await fetch('/api/create-contribution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contribution)
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result?.details ? `${result.error || 'Failed to save contribution'}: ${result.details}` : (result?.error || 'Failed to save contribution');
        throw new Error(errorMessage);
      }

      const savedContribution: Contribution = result.contribution;

      setContributions(prev => [savedContribution, ...prev]);
      setTeamMembers(prev => prev.map(member => 
        member.id === savedContribution.collector 
          ? { ...member, collections: member.collections + Number(savedContribution.amount) }
          : member
      ));

      return savedContribution;
    } catch (error) {
      console.error('Contribution save error:', error);
      alert(error instanceof Error ? error.message : 'Failed to save contribution');
      return null;
    }
  };

  const deleteContribution = async (id: string) => {
    const toDelete = contributions.find(c => c.id === id);
    if (!toDelete) return;
    
    // Update local state immediately
    setContributions(prev => prev.filter(c => c.id !== id));
    
    const member = teamMembers.find(m => m.id === toDelete.collector);
    const newTotal = member ? Math.max(0, member.collections - Number(toDelete.amount)) : 0;
    
    setTeamMembers(prev => prev.map(m => 
      m.id === toDelete.collector ? { ...m, collections: newTotal } : m
    ));

    if (member) {
      await supabase
        .from('team_members')
        .update({ collections: newTotal })
        .eq('id', member.id);
    }
    
    // Delete in Supabase by proper id (primary key)
    const { error } = await supabase
      .from('contributions')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Failed to delete contribution from Supabase:', error);
      // Optionally restore local state on failure
      setContributions(prev => [...prev, toDelete]);
      alert('Failed to delete contribution. Please try again.');
    }
  };

  const addExpenditure = (expenditure: Expenditure) => {
    setExpenditures(prev => [expenditure, ...prev]);
  };

  const deleteExpenditure = (id: string) => {
    setExpenditures(prev => prev.filter(e => e.id !== id));
  };

  const addTeamMember = async (member: TeamMember) => {
    setTeamMembers(prev => [...prev, member]);
    
    // Sync to Supabase
    const { error } = await supabase.from('team_members').insert([{
      id: member.id,
      name: member.name,
      role: member.role,
      collections: member.collections,
      status: member.status,
      password: member.password
    }]);

    if (error) {
      console.error('Supabase Insert Error (Team Member):', error.message);
      alert(`Failed to save team member: ${error.message}`);
    }
  };

  const updateTeamMember = async (id: string, updates: Partial<TeamMember>) => {
    // 1. Optimistic UI update
    setTeamMembers(prev => prev.map(member => 
      member.id === id ? { ...member, ...updates } : member
    ));

    // 2. Sync to Supabase
    // If the ID itself changed, Supabase requires updating the primary key field
    // which is what we map `updates.id` to inside the query
    const { error } = await supabase
      .from('team_members')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Supabase Update Error:', error.message);
      alert(`Failed to update member: ${error.message}`);
    }
  };

  const deleteTeamMember = async (id: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== id));
    
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Supabase Delete Error:', error.message);
      alert(`Failed to delete member: ${error.message}`);
    }
  };

  const addPhoto = async (photo: Photo) => {
    setGallery(prev => [photo, ...prev]);
    // Invalidate gallery cache immediately to force fresh fetch on next page load
    try {
      localStorage.removeItem('egb_gallery_fresh_until');
    } catch (e) {
      console.warn('Failed to invalidate gallery cache:', e);
    }

    // Sync to Supabase
    const { data, error } = await supabase.from('gallery').insert([{
      url: photo.url,
      year: photo.year,
      caption: photo.caption,
      type: photo.type
    }]).select().single();

    if (error) {
      console.error('Supabase Insert Error (gallery):', error.message);
      alert(`Failed to save photo to database: ${error.message}`);
    } else if (data) {
      // Update the local list with the real database UUID so delete works
      setGallery(prev => prev.map(p => p.id === photo.id ? { ...p, id: data.id } : p));
    }
  };

  const deletePhoto = async (id: string) => {
    setGallery(prev => prev.filter(photo => photo.id !== id));
    // Invalidate gallery cache immediately to force fresh fetch
    try {
      localStorage.removeItem('egb_gallery_fresh_until');
    } catch (e) {
      console.warn('Failed to invalidate gallery cache:', e);
    }

    // Sync to Supabase
    const { error } = await supabase.from('gallery').delete().eq('id', id);
    if (error) {
      console.error('Supabase Delete Error (gallery):', error.message);
      alert(`Failed to delete photo: ${error.message}`);
    }
  };

  const addSuggestion = async (suggestion: Omit<Suggestion, 'id' | 'likes' | 'dislikes'>) => {
    // Create a temporary ID for optimistic UI
    const tempId = `SUG-${Date.now()}`;
    const fullSuggestion: Suggestion = {
      ...suggestion,
      id: tempId,
      likes: 0,
      dislikes: 0
    };

    // Optimistic UI
    setSuggestions(prev => [fullSuggestion, ...prev]);

    const { data, error } = await supabase.from('suggestions').insert([{
      name: suggestion.name,
      phone: suggestion.phone,
      suggestion: suggestion.suggestion,
      likes: 0,
      dislikes: 0
    }]).select().single();

    if (error) {
      console.error('Supabase Insert Error (suggestions):', error.message);
    } else if (data) {
      setSuggestions(prev => prev.map(s => s.id === tempId ? { ...s, id: data.id } : s));
    }
  };

  const deleteSuggestion = async (id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
    const { error } = await supabase.from('suggestions').delete().eq('id', id);
    if (error) {
      console.error('Supabase Delete Error (suggestions):', error.message);
    }
  };

  const voteSuggestion = async (id: string, type: 'like' | 'dislike'): Promise<boolean> => {
    // Check if user has already voted on this suggestion
    if (userVotes[id]) {
      console.warn('User has already voted on this suggestion');
      return false;
    }

    // Get a unique user identifier (using localStorage or generate one)
    let userId = localStorage.getItem('egb_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('egb_user_id', userId);
    }

    // Optimistic UI update
    setSuggestions(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          likes: type === 'like' ? s.likes + 1 : s.likes,
          dislikes: type === 'dislike' ? s.dislikes + 1 : s.dislikes
        };
      }
      return s;
    }));

    // Track local vote
    setUserVotes(prev => ({ ...prev, [id]: type }));

    // Save vote to database
    try {
      const { error: voteError } = await supabase.from('suggestion_votes').insert({
        suggestion_id: id,
        user_id: userId,
        vote_type: type
      });

      if (voteError) {
        console.error('Error saving vote:', voteError.message);
        // Revert optimistic update on error
        setSuggestions(prev => prev.map(s => {
          if (s.id === id) {
            return {
              ...s,
              likes: type === 'like' ? s.likes - 1 : s.likes,
              dislikes: type === 'dislike' ? s.dislikes - 1 : s.dislikes
            };
          }
          return s;
        }));
        setUserVotes(prev => {
          const newVotes = { ...prev };
          delete newVotes[id];
          return newVotes;
        });
        return false;
      }

      // Update the suggestion's like/dislike count in the database
      const current = suggestions.find(s => s.id === id);
      if (current) {
        const newLikes = type === 'like' ? current.likes + 1 : current.likes;
        const newDislikes = type === 'dislike' ? current.dislikes + 1 : current.dislikes;
        
        await supabase.from('suggestions').update({
          likes: newLikes,
          dislikes: newDislikes
        }).eq('id', id);
      }

      return true;
    } catch (error) {
      console.error('Error voting:', error);
      return false;
    }
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    // Optimistically update local state
    setSettings(prev => ({ ...prev, ...updates }));

    // Sync to Supabase
    const supabaseUpdates = {
      show_names_publicly: updates.showNamesPublicly,
      show_amounts_publicly: updates.showAmountsPublicly,
      show_expenditure_publicly: updates.showExpenditurePublicly,
      festival_name: updates.festivalName,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('app_settings')
      .upsert({ id: 'default', ...supabaseUpdates }, { onConflict: 'id' });

    if (error) {
      console.error('Supabase Update Error (app_settings):', error.message);
    }
  };

  // Event Actions
  const addEvent = async (event: Omit<Event, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('events').insert([event]).select().single();

    if (error) {
      console.error('Supabase Insert Error (events):', error.message);
      alert(`Failed to add event: ${error.message}`);
    } else if (data) {
      setEvents(prev => [data, ...prev]);
    }
  };

  const deleteEvent = async (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      console.error('Supabase Delete Error (events):', error.message);
    }
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase Update Error (events):', error.message);
      alert(`Failed to update event: ${error.message}`);
    } else if (data) {
      setEvents(prev => prev.map(e => e.id === id ? data : e));
    }
  };

  const applyForEvent = async (application: Omit<EventApplication, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('event_applications').insert([application]).select().single();

    if (error) {
      console.error('Supabase Insert Error (event_applications):', error.message);
      alert(`Failed to submit application: ${error.message}`);
    } else if (data) {
      setEventApplications(prev => [data, ...prev]);
    }
  };

  const deleteEventApplication = async (id: string) => {
    setEventApplications(prev => prev.filter(a => a.id !== id));
    const { error } = await supabase.from('event_applications').delete().eq('id', id);
    if (error) {
      console.error('Supabase Delete Error (event_applications):', error.message);
    }
  };

  return (
    <DataContext.Provider value={{
      contributions,
      expenditures,
      teamMembers,
      gallery,
      suggestions,
      events,
      eventApplications,
      userVotes,
      settings,
      addContribution,
      deleteContribution,
      addExpenditure,
      deleteExpenditure,
      addTeamMember,
      updateTeamMember,
      deleteTeamMember,
      addPhoto,
      deletePhoto,
      addSuggestion,
      deleteSuggestion,
      voteSuggestion,
      addEvent,
      updateEvent,
      deleteEvent,
      applyForEvent,
      deleteEventApplication,
      updateSettings,
      totalCollection,
      totalExpenditure,
      balance
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

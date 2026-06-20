import { unstable_cache } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { defaultSettings, type InitialDataSnapshot } from '@/context/DataContext';

const loadInitialAppData = async (): Promise<InitialDataSnapshot> => {
  const [
    contributionsResult,
    expendituresResult,
    teamMembersResult,
    galleryResult,
    vlogsResult,
    suggestionsResult,
    eventsResult,
    settingsResult,
  ] = await Promise.allSettled([
    supabase.from('contributions').select('id,name,house,phone,amount,mode,date,collector,receipt_number,receipt_url,receipt_created_at').order('date', { ascending: false }),
    supabase.from('expenditures').select('id,category,description,amount,date').order('date', { ascending: false }),
    supabase.from('team_members').select('id,name,role,collections,status,password,is_enabled,is_online,id_card_url'),
    supabase.from('gallery').select('*').order('created_at', { ascending: false }),
    supabase.from('vlogs').select('*').order('created_at', { ascending: false }),
    supabase.from('suggestions').select('*').order('created_at', { ascending: false }),
    supabase.from('events').select('id,name,description,poster_url,date,time,venue,application_last_date,is_registration_open,created_at').order('created_at', { ascending: false }),
    supabase.from('app_settings').select('*').eq('id', 'default').single(),
  ]);

  return {
    contributions: contributionsResult.status === 'fulfilled' && !contributionsResult.value.error ? contributionsResult.value.data ?? [] : [],
    expenditures: expendituresResult.status === 'fulfilled' && !expendituresResult.value.error ? expendituresResult.value.data ?? [] : [],
    teamMembers: teamMembersResult.status === 'fulfilled' && !teamMembersResult.value.error ? teamMembersResult.value.data ?? [] : [],
    gallery: galleryResult.status === 'fulfilled' && !galleryResult.value.error ? galleryResult.value.data ?? [] : [],
    vlogs: vlogsResult.status === 'fulfilled' && !vlogsResult.value.error ? vlogsResult.value.data ?? [] : [],
    suggestions: suggestionsResult.status === 'fulfilled' && !suggestionsResult.value.error ? suggestionsResult.value.data ?? [] : [],
    events: eventsResult.status === 'fulfilled' && !eventsResult.value.error ? eventsResult.value.data ?? [] : [],
    settings: settingsResult.status === 'fulfilled' && !settingsResult.value.error && settingsResult.value.data
      ? {
          showNamesPublicly: settingsResult.value.data.show_names_publicly,
          showAmountsPublicly: settingsResult.value.data.show_amounts_publicly,
          showExpenditurePublicly: settingsResult.value.data.show_expenditure_publicly,
          allowReceiptDownload: settingsResult.value.data.allow_receipt_download ?? true,
          festivalName: settingsResult.value.data.festival_name,
        }
      : defaultSettings,
  };
};

export const getInitialAppData = unstable_cache(
  loadInitialAppData,
  ['egb-initial-app-data'],
  {
    revalidate: 60,
    tags: ['egb-app-data'],
  }
);

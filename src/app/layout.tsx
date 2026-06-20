import React from 'react';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import type { InitialDataSnapshot } from '@/context/DataContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jiqztujpobafjvoukflt.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppcXp0dWpwb2JhZmp2b3VrZmx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTczMjMsImV4cCI6MjA5Mjc5MzMyM30.iBhklbiJ84K2xF6lF078mEKGzVxR8gifLScWd1hZ1Jo';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const defaultSettings = {
  showNamesPublicly: true,
  showAmountsPublicly: false,
  showExpenditurePublicly: true,
  allowReceiptDownload: true,
  festivalName: 'TEAM EGB - Ganesha Chaturthi Celebrations',
};

const mapContributionRecord = (record: any) => ({
  id: record.id,
  name: record.name ?? '',
  house: record.house ?? '',
  phone: record.phone ?? '',
  amount: Number(record.amount ?? 0),
  mode: record.mode ?? '',
  date: record.date ?? '',
  collector: record.collector ?? '',
  receipt_number: record.receipt_number ?? undefined,
  receipt_url: record.receipt_url ?? undefined,
  receipt_created_at: record.receipt_created_at ?? undefined,
});

const loadInitialAppData = unstable_cache(async (): Promise<InitialDataSnapshot> => {
  const [
    contributionsResult,
    expendituresResult,
    teamMembersResult,
    galleryResult,
    vlogsResult,
    suggestionsResult,
    eventsResult,
    eventApplicationsResult,
    settingsResult,
  ] = await Promise.all([
    supabase
      .from('contributions')
      .select('id,name,house,phone,amount,mode,date,collector,receipt_number,receipt_url,receipt_created_at')
      .order('date', { ascending: false })
      .limit(50),
    supabase
      .from('expenditures')
      .select('id,category,description,amount,date')
      .order('date', { ascending: false }),
    supabase
      .from('team_members')
      .select('id,name,role,collections,status,password,is_enabled,is_online,id_card_url')
      .order('name', { ascending: true }),
    supabase
      .from('gallery')
      .select('id,year,url,caption,type,created_at')
      .order('created_at', { ascending: false })
      .limit(24),
    supabase
      .from('vlogs')
      .select('id,title,youtube_url,description,thumbnail_url,published_at,created_at,is_public')
      .order('created_at', { ascending: false }),
    supabase
      .from('suggestions')
      .select('id,name,phone,suggestion,likes,dislikes,created_at')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('events')
      .select('id,name,description,poster_url,date,time,venue,application_last_date,is_registration_open,created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('event_applications')
      .select('id,event_id,name,phone,age,activity,created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('app_settings')
      .select('*')
      .eq('id', 'default')
      .single(),
  ]);

  return {
    contributions: contributionsResult.data?.map(mapContributionRecord),
    expenditures: expendituresResult.data ?? undefined,
    teamMembers: teamMembersResult.data ?? undefined,
    gallery: galleryResult.data ?? undefined,
    vlogs: vlogsResult.data ?? undefined,
    suggestions: suggestionsResult.data ?? undefined,
    events: eventsResult.data ?? undefined,
    eventApplications: eventApplicationsResult.data ?? undefined,
    settings: settingsResult.data
      ? {
          showNamesPublicly: settingsResult.data.show_names_publicly,
          showAmountsPublicly: settingsResult.data.show_amounts_publicly,
          showExpenditurePublicly: settingsResult.data.show_expenditure_publicly,
          allowReceiptDownload: settingsResult.data.allow_receipt_download ?? true,
          festivalName: settingsResult.data.festival_name,
        }
      : defaultSettings,
  };
}, ['initial-app-data'], { revalidate: 60 });

export const metadata: Metadata = {
  title: "TEAM EGB Ganesha Chaturthi Celebrations",
  description: "Devotion • Faith • Unity - TEAM EGB",
  icons: {
    icon: [
      { url: "/logo_v2.jpg", type: "image/jpeg" },
    ],
    apple: "/logo_v2.jpg",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export default async function RootLayout({ children }: any) {
  const initialData = await loadInitialAppData();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://img.youtube.com" />
        <link rel="preconnect" href="https://vitals.vercel-analytics.com" />
        <link rel="dns-prefetch" href="https://supabase.co" />
        <link rel="icon" href="/logo_v2.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/logo_v2.jpg" />
        <meta name="color-scheme" content="light dark" />
        
        {/* Performance optimizations */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#ea580c" />
      </head>
      <body className="min-h-full flex flex-col relative" suppressHydrationWarning>
        <Analytics />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <DataProvider initialData={initialData}>
            <AuthProvider>
              {children}
            </AuthProvider>
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

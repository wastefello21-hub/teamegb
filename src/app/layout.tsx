import React from 'react';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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

export default function RootLayout({ children }: any) {
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
        
        {/* Performance optimizations */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#ea580c" />
      </head>
      <body className="min-h-full flex flex-col relative" suppressHydrationWarning>
        <Analytics />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <DataProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

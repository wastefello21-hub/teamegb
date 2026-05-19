"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Download, Search, BadgeCheck, Clock3, ScanBarcode } from 'lucide-react';

type ReceiptRecord = {
  receipt_number: string;
  receipt_url: string;
  name: string;
  phone: string;
  amount: number;
  mode: string;
  date: string;
  collector: string;
  house?: string;
};

export default function EReceiptPage() {
  const [receiptNumber, setReceiptNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ReceiptRecord | null>(null);
  const autoDownloadTriggered = useRef(false);

  const triggerDownload = (url: string, number: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${number}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const lookupReceipt = async (number: string) => {
    const cleaned = number.trim();

    if (!/^\d{6}$/.test(cleaned)) {
      setError('Please enter a valid 6-digit receipt number.');
      setReceipt(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setReceipt(null);

    try {
      const response = await fetch(`/api/get-receipt?receiptNumber=${encodeURIComponent(cleaned)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Receipt not found');
      }

      setReceipt(data.receipt);
      if (data.receipt?.receipt_url) {
        triggerDownload(`/api/download-receipt?receiptNumber=${encodeURIComponent(data.receipt.receipt_number)}`, data.receipt.receipt_number);
      }
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : 'Failed to fetch receipt');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined' || autoDownloadTriggered.current) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const receiptParam = params.get('receipt');

    if (receiptParam) {
      autoDownloadTriggered.current = true;
      setReceiptNumber(receiptParam);
      lookupReceipt(receiptParam);
    }
  }, []);

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,182,64,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(239,68,68,0.14),_transparent_34%),linear-gradient(180deg,_rgba(255,248,230,0.95),_rgba(255,255,255,0.72))] dark:bg-[radial-gradient(circle_at_top,_rgba(255,182,64,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(239,68,68,0.1),_transparent_34%),linear-gradient(180deg,_rgba(15,15,15,0.96),_rgba(24,24,24,0.92))]" />
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] items-start">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-orange-700 dark:text-orange-300">
                <ScanBarcode className="h-4 w-4" /> Public E-Receipt
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-tight">
                Find, open, and download your contribution receipt.
              </h1>
              <p className="max-w-xl text-base md:text-lg text-foreground/70">
                Enter the 6-digit receipt number generated when the contribution was recorded. The exact matching receipt will open instantly and download automatically.
              </p>
            </motion.div>

            <GlassCard className="p-5 md:p-6 border border-orange-500/15 bg-gradient-to-br from-white/90 to-orange-50/40 dark:from-neutral-950/85 dark:to-neutral-900/70 shadow-2xl shadow-orange-500/10">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  lookupReceipt(receiptNumber);
                }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="receiptNumber" className="mb-2 block text-sm font-semibold text-foreground/80">
                    Receipt Number
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/35" />
                    <input
                      id="receiptNumber"
                      value={receiptNumber}
                      onChange={(event) => setReceiptNumber(event.target.value.replace(/\D/g, '').slice(0, 6))}
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="123456"
                      className="w-full rounded-2xl border border-border-color bg-background/90 px-12 py-4 text-lg font-semibold tracking-[0.28em] uppercase outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-2xl bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 transition-transform duration-200 hover:scale-[1.01]"
                >
                  {isLoading ? 'Searching Receipt...' : 'Open Receipt'}
                </Button>
              </form>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 text-sm text-foreground/70">
                <div className="flex items-center gap-3 rounded-2xl bg-foreground/5 px-4 py-3">
                  <BadgeCheck className="h-5 w-5 text-orange-500" />
                  Unique 6-digit receipt code
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-foreground/5 px-4 py-3">
                  <Clock3 className="h-5 w-5 text-orange-500" />
                  Auto-download after lookup
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </div>

          <div className="lg:pt-6">
            <AnimatePresence mode="wait">
              {receipt ? (
                <motion.div
                  key={receipt.receipt_number}
                  initial={{ opacity: 0, y: 18, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 18, scale: 0.98 }}
                >
                  <GlassCard className="overflow-hidden border border-orange-500/15 bg-white/85 dark:bg-neutral-950/90 shadow-[0_30px_100px_rgba(0,0,0,0.22)]">
                    <div className="border-b border-border-color bg-gradient-to-r from-orange-500/10 via-transparent to-red-500/10 px-5 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-orange-600 dark:text-orange-300 font-semibold">Matched Receipt</p>
                          <h2 className="mt-1 text-2xl font-black text-foreground">No. {receipt.receipt_number}</h2>
                        </div>
                        <a
                          href={receipt.receipt_url}
                          download={`receipt-${receipt.receipt_number}.png`}
                          className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-colors hover:bg-orange-600"
                        >
                          <Download className="mr-2 h-4 w-4" /> Download
                        </a>
                      </div>
                    </div>

                    <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
                      <div className="border-b lg:border-b-0 lg:border-r border-border-color bg-gradient-to-br from-orange-50/70 to-amber-50/30 dark:from-white/5 dark:to-white/[0.02] p-5">
                        <div className="relative overflow-hidden rounded-3xl border border-white/60 dark:border-white/10 bg-[#f9f0d8] shadow-inner shadow-orange-500/5">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),_transparent_35%)]" />
                          <div className="p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="max-w-[55%]">
                                <p className="text-sm font-semibold uppercase tracking-wide text-amber-800">TEAM EGB</p>
                                <h3 className="mt-2 text-3xl font-extrabold text-amber-900 leading-tight">Contribution Receipt</h3>
                              </div>
                              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-foreground/10 shadow-lg">
                                <Image src="/logo_v2.jpg" alt="TEAM EGB logo" fill className="object-cover" />
                              </div>
                            </div>
                            <div className="mt-5 space-y-3 text-base text-amber-900">
                              <div><span className="font-semibold text-amber-900">Name:</span> <span className="ml-2 font-medium text-amber-800">{receipt.name}</span></div>
                              <div><span className="font-semibold text-amber-900">Phone:</span> <span className="ml-2 font-medium text-amber-800">{receipt.phone}</span></div>
                              <div><span className="font-semibold text-amber-900">Amount:</span> <span className="ml-2 font-medium text-amber-800">₹ {receipt.amount.toLocaleString('en-IN')}</span></div>
                              <div><span className="font-semibold text-amber-900">Mode:</span> <span className="ml-2 font-medium text-amber-800">{receipt.mode}</span></div>
                              <div><span className="font-semibold text-amber-900">Date:</span> <span className="ml-2 font-medium text-amber-800">{receipt.date}</span></div>
                              <div><span className="font-semibold text-amber-900">Collected By:</span> <span className="ml-2 font-medium text-amber-800">{receipt.collector}</span></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 md:p-6">
                        <p className="text-sm text-foreground/65">
                          The matching receipt is ready. Download it or keep the receipt number safe for future lookup.
                        </p>
                        <div className="mt-5 rounded-3xl border border-dashed border-orange-500/25 bg-orange-500/5 p-4">
                          <p className="text-xs uppercase tracking-[0.3em] text-orange-600 dark:text-orange-300 font-semibold">Stored Record</p>
                          <div className="mt-3 space-y-2 text-sm text-foreground/75">
                            <p><span className="font-semibold text-foreground">Receipt Number:</span> {receipt.receipt_number}</p>
                            <p><span className="font-semibold text-foreground">Download:</span> Immediate on lookup</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[2rem] border border-dashed border-border-color/80 bg-white/40 dark:bg-white/5 p-10 text-center text-foreground/55 shadow-inner"
                >
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                    <ScanBarcode className="h-9 w-9" />
                  </div>
                  <p className="text-lg font-semibold text-foreground/80">Your receipt preview will appear here.</p>
                  <p className="mt-2 text-sm">Enter a 6-digit receipt number to fetch the exact contribution record.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { CheckCircle2, LogOut, CreditCard, ChevronLeft, ScanSearch, Maximize2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';

export default function TeamDashboard() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    houseNumber: '',
    contributorName: '',
    phoneNumber: '',
    amount: '',
    paymentMode: 'Cash',
    note: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showUpi, setShowUpi] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);
  const [showFullscreenIdCard, setShowFullscreenIdCard] = useState(false);
  const [idCardUrl, setIdCardUrl] = useState<string | null>(null);
  const [idCardLoading, setIdCardLoading] = useState(false);
  const [idCardError, setIdCardError] = useState<string | null>(null);
  const [generatedReceipt, setGeneratedReceipt] = useState<{
    receipt_number: string;
    receipt_url: string;
  } | null>(null);
  const { addContribution } = useData();
  const { user, logout, loading } = useAuth(); // Import the logged-in user

  useEffect(() => {
    if (!loading && !user) {
      router.push('/team/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Fetch ID card when component mounts
    if (user?.teamMemberId && showIdCard) {
      fetchIdCard();
    }
  }, [user?.teamMemberId, showIdCard]);

  useEffect(() => {
    if (!showFullscreenIdCard) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowFullscreenIdCard(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showFullscreenIdCard]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'paymentMode' && e.target.value === 'UPI') {
      setShowUpi(true);
    } else if (e.target.name === 'paymentMode') {
      setShowUpi(false);
    }
  };

  const fetchIdCard = async () => {
    if (!user?.teamMemberId) return;
    
    setIdCardLoading(true);
    setIdCardError(null);
    try {
      const response = await fetch(`/api/get-id-card?memberId=${user.teamMemberId}`);
      const data = await response.json();
      
      if (response.ok) {
        if (data.idCardUrl) {
          setIdCardUrl(data.idCardUrl);
        } else {
          setIdCardError('No ID card has been uploaded yet. Please contact your administrator.');
        }
      } else {
        setIdCardError(data.error || 'Failed to fetch ID card');
      }
    } catch (error) {
      console.error('Error fetching ID card:', error);
      setIdCardError('Failed to load ID card');
    } finally {
      setIdCardLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setGeneratedReceipt(null);
    
    try {
      // Safely default to 'Admin' or 'EGB-01' if user ID is somehow stripped, but try to use live auth
      const collectorId = user?.teamMemberId || user?.uid || 'Unknown';

      const createdContribution = await addContribution({
        name: formData.contributorName,
        house: formData.houseNumber,
        phone: formData.phoneNumber,
        amount: Number(formData.amount),
        mode: formData.paymentMode,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        collector: collectorId
      });
      
      if (!createdContribution) {
        setIsSubmitting(false);
        return;
      }

      setGeneratedReceipt({
        receipt_number: createdContribution.receipt_number || '------',
        receipt_url: createdContribution.receipt_url || ''
      });
      setIsSubmitting(false);
      setSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setGeneratedReceipt(null);
        setFormData({
          houseNumber: '',
          contributorName: '',
          phoneNumber: '',
          amount: '',
          paymentMode: 'Cash',
          note: ''
        });
      }, 3000);
    } catch (error) {
      console.error("Submission failed", error);
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-[70vh] text-center px-4"
      >
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Success!</h2>
        <p className="text-foreground/70 mb-8 max-w-xs">
          Contribution of ₹{formData.amount} from {formData.contributorName} recorded. A WhatsApp thank you message has been triggered.
        </p>
        {generatedReceipt && (
          <div className="mb-6 w-full max-w-md rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-white/70 to-amber-500/10 dark:from-orange-500/10 dark:via-black/20 dark:to-amber-500/5 p-5 text-left shadow-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-orange-600 dark:text-orange-300 font-semibold">E-Receipt Generated</p>
            <h3 className="mt-2 text-2xl font-black text-foreground">Receipt No. {generatedReceipt.receipt_number}</h3>
            <p className="mt-2 text-sm text-foreground/70">
              The receipt has been stored in Supabase and can be opened from the public e-receipt page.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <a href={`/e-receipt?receipt=${generatedReceipt.receipt_number}`} className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600">
                Open Receipt Page
              </a>
              {generatedReceipt.receipt_number ? (
                <a href={`/api/download-receipt?receiptNumber=${generatedReceipt.receipt_number}`} download={`receipt-${generatedReceipt.receipt_number}.png`} className="inline-flex items-center justify-center rounded-2xl border border-border-color bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/5">
                  Download Image
                </a>
              ) : null}
            </div>
          </div>
        )}
        <Button onClick={() => setSuccess(false)}>Add Another</Button>
      </motion.div>
    );
  }

  if (loading || !user) {
    return <div className="text-center py-20 animate-pulse">Loading secure session...</div>;
  }

  // ID Card Modal
  if (showIdCard) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] items-start"
        >
          <GlassCard className="relative overflow-hidden border-t-4 border-t-orange-500 h-full">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-orange-500/15 via-amber-400/10 to-red-500/10 pointer-events-none" />
            <div className="relative flex flex-col gap-6">
              <div className="flex items-center justify-between gap-4">
                <button 
                  onClick={() => setShowIdCard(false)}
                  className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors"
                >
                  <ChevronLeft size={16} /> Back to Dashboard
                </button>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20">
                  <ScanSearch size={14} /> Team ID
                </span>
              </div>
              <div className="grid gap-5 sm:grid-cols-[auto_1fr] items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <CreditCard size={30} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">Your ID Card</h2>
                  <p className="text-foreground/60 text-sm mt-1">{user?.name || user?.displayName || user?.teamMemberId}</p>
                </div>
              </div>

              {idCardLoading ? (
                <div className="w-full flex items-center justify-center py-16 rounded-3xl border border-dashed border-border-color bg-white/40 dark:bg-black/10">
                  <div className="animate-pulse text-foreground/50">Loading your ID card...</div>
                </div>
              ) : idCardError ? (
                <div className="w-full bg-orange-100/50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 text-sm rounded-2xl p-5">
                  {idCardError}
                </div>
              ) : idCardUrl ? (
                <button
                  onClick={() => setShowFullscreenIdCard(true)}
                  className="group relative w-full text-left"
                  title="Open ID card fullscreen"
                >
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-500/10 via-transparent to-red-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="relative rounded-3xl p-3 sm:p-4 bg-gradient-to-b from-white/80 to-white/60 dark:from-gray-900 dark:to-gray-950 border border-white/70 dark:border-white/10 shadow-2xl overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-red-500" />
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs uppercase tracking-[0.3em] text-foreground/45 font-semibold">Preview</div>
                      <span className="inline-flex items-center gap-1 text-xs text-orange-600 dark:text-orange-300">
                        <Maximize2 size={12} /> Click to expand
                      </span>
                    </div>
                    <img 
                      src={idCardUrl} 
                      alt="ID Card" 
                      className="w-full h-auto rounded-2xl object-contain shadow-lg transition-transform duration-300 group-hover:scale-[1.01]"
                    />
                  </div>
                </button>
              ) : null}
            </div>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard className="border border-orange-500/15 bg-gradient-to-br from-white/80 to-orange-50/30 dark:from-gray-900 dark:to-gray-950">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Member Details</h3>
                  <p className="text-sm text-foreground/60">Unique to your login</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-foreground/5 px-4 py-3">
                  <div className="text-foreground/45 text-xs uppercase tracking-wide">Member ID</div>
                  <div className="font-semibold mt-1 break-all">{user?.teamMemberId || 'Unknown'}</div>
                </div>
                <div className="rounded-2xl bg-foreground/5 px-4 py-3">
                  <div className="text-foreground/45 text-xs uppercase tracking-wide">Status</div>
                  <div className="font-semibold mt-1">Active</div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="border border-border-color">
              <h3 className="font-bold text-lg mb-2">Quick actions</h3>
              <p className="text-sm text-foreground/60 mb-5">Switch between your collection form and ID card quickly.</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowIdCard(false)}
                  className="px-4 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors text-sm font-medium"
                >
                  Collection Form
                </button>
                <button
                  onClick={() => setShowFullscreenIdCard(true)}
                  disabled={!idCardUrl}
                  className="px-4 py-2 rounded-full border border-border-color hover:border-orange-500 hover:text-orange-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Fullscreen ID
                </button>
              </div>
            </GlassCard>
          </div>
        </motion.div>

        {showFullscreenIdCard && idCardUrl && (
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8">
            <button
              onClick={() => setShowFullscreenIdCard(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[210] inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white hover:bg-white/20 transition-colors"
            >
              <X size={16} /> Close
            </button>
            <div className="w-full h-full sm:max-w-6xl sm:max-h-[92vh] overflow-auto rounded-none sm:rounded-3xl bg-white p-2 sm:p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
              <img
                src={idCardUrl}
                alt="Fullscreen ID Card"
                className="w-full h-auto rounded-2xl object-contain"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-[0.24em] uppercase bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20 mb-4">
            Collection Desk
          </div>
          <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-orange-600 dark:text-orange-400">New Collection</h2>
          <p className="mt-2 text-sm lg:text-base text-foreground/60">Fill details to register a contribution, then review your ID card in the same workspace.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 lg:justify-end">
          <button 
            onClick={() => setShowIdCard(true)}
            className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20 hover:bg-orange-500/20 transition-colors whitespace-nowrap"
            title="View your ID card"
          >
            <CreditCard size={14} /> View ID Card
          </button>
          <button 
            onClick={() => {
              logout();
            }}
            className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors whitespace-nowrap"
          >
            <LogOut size={14} /> Exit
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] items-start">
        <GlassCard className="border-t-4 border-t-orange-500 h-full p-4 sm:p-6 lg:p-8">
        {showUpi && (
          <div className="mb-6 flex flex-col items-center justify-center">
            <img
              src="/upi-qr.png"
              alt="UPI QR Code for Payment"
              className="w-full max-w-xs sm:max-w-sm aspect-square object-contain border-2 border-dashed border-orange-400 rounded-3xl bg-white mb-3 p-3 shadow-lg"
            />
            <div className="text-center text-xs text-foreground/70">
              <div className="font-bold text-base text-orange-700">VEMALA PRAJWAL</div>
              <div>UPI ID: <span className="font-mono">9380753581@naviaxis</span></div>
              <div className="mt-1 text-[11px]">Scan & pay using any UPI app</div>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-foreground/70">House/Area</label>
              <input 
                type="text" 
                name="houseNumber"
                value={formData.houseNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g. #42, Main St"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-foreground/70">Phone</label>
              <input 
                type="tel" 
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="10 digit number"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-foreground/70">Contributor Name</label>
            <input 
              type="text" 
              name="contributorName"
              value={formData.contributorName}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Full Name"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-foreground/70">Amount (₹)</label>
              <input 
                type="number" 
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg font-bold text-orange-600 dark:text-orange-400"
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-foreground/70">Mode</label>
              <select 
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-foreground/70">Optional Note</label>
            <input 
              type="text" 
              name="note"
              value={formData.note}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Any specific wishes or remarks"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full py-4 text-lg mt-6 shadow-xl shadow-orange-500/20" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Submit Contribution'}
          </Button>
        </form>
        </GlassCard>

        <div className="space-y-6 lg:sticky lg:top-6">
          <GlassCard className="border border-orange-500/15 bg-gradient-to-br from-white/90 to-orange-50/50 dark:from-gray-900 dark:to-gray-950 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                <CreditCard size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Your ID card</h3>
                <p className="text-sm text-foreground/60">Tap the preview to expand fullscreen.</p>
              </div>
            </div>
            <button
              onClick={() => setShowIdCard(true)}
              className="group block w-full text-left"
            >
              <div className="rounded-3xl p-3 bg-gradient-to-b from-white/80 to-white/60 dark:from-gray-950 dark:to-gray-900 border border-white/70 dark:border-white/10 shadow-xl overflow-hidden transition-transform duration-300 group-hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-[0.24em] text-foreground/45 font-semibold">ID preview</span>
                  <span className="inline-flex items-center gap-1 text-xs text-orange-600 dark:text-orange-300">
                    <Maximize2 size={12} /> Fullscreen
                  </span>
                </div>
                <div className="aspect-[1.6/1] rounded-2xl bg-gradient-to-br from-orange-500 via-amber-400 to-red-500 p-4 text-white shadow-2xl flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.28em] text-white/75">Festival ID</div>
                      <div className="mt-1 text-xl font-black">{user?.teamMemberId || 'EGB-01'}</div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                      <CreditCard size={22} />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{user?.name || user?.displayName || 'Team Member'}</div>
                    <div className="text-xs text-white/75 mt-1">Click to view fullscreen</div>
                  </div>
                </div>
              </div>
            </button>
          </GlassCard>

          <GlassCard className="p-4 sm:p-6">
            <h3 className="text-lg font-bold mb-2">Desktop tips</h3>
            <p className="text-sm text-foreground/60 leading-6">
              The left panel is for collection entry, and the right panel keeps your ID card and quick actions visible on larger screens.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

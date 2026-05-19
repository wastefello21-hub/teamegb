"use client";

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Search, Download, Filter, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '@/context/DataContext';

export default function ManageContributionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { contributions, deleteContribution } = useData();

  const confirmDelete = () => {
    if (deletingId) {
      deleteContribution(deletingId);
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'House', 'Phone', 'Amount', 'Payment Mode', 'Date', 'Collector ID', 'Receipt No.'];
    const csvContent = [
      headers.join(','),
      ...contributions.map(tx => 
        [tx.id, tx.name, tx.house, tx.phone, tx.amount, tx.mode, tx.date, tx.collector, tx.receipt_number || '']
          .map(val => `"${val}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'contributions_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredContributions = contributions.filter(tx => 
    tx.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.house.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.phone.includes(searchTerm) ||
    (tx.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 md:pb-0 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400">Contributions Ledger</h2>
          <p className="text-sm text-foreground/60">View, search, and export all received contributions.</p>
        </div>
        <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
          <Download size={18} />
          Export CSV
        </Button>
      </div>

      <GlassCard className="p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search by name, house, phone, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <Button variant="secondary" className="flex items-center gap-2 shrink-0">
            <Filter size={18} />
            Filters
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-border-color text-sm text-foreground/60 uppercase tracking-wider">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Contributor Details</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Payment Mode</th>
                <th className="p-4 font-semibold">Collector ID</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              <AnimatePresence>
                {filteredContributions.map((tx) => (
                  <motion.tr 
                    key={tx.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                    className="hover:bg-foreground/5 transition-colors"
                  >
                    <td className="p-4 text-sm text-foreground/80">{tx.date}</td>
                    <td className="p-4">
                      <p className="font-medium">{tx.name}</p>
                      <p className="text-xs text-foreground/60">{tx.house} • {tx.phone}</p>
                      <p className="text-[10px] text-foreground/40 mt-0.5">{tx.id}</p>
                      {tx.receipt_number && (
                        <p className="text-[10px] text-orange-600 dark:text-orange-300 mt-0.5 font-semibold tracking-wide">
                          Receipt #{tx.receipt_number}
                        </p>
                      )}
                    </td>
                    <td className="p-4 font-bold text-green-600 dark:text-green-400">₹{tx.amount}</td>
                    <td className="p-4">
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                        {tx.mode}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-foreground/70">{tx.collector}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {tx.receipt_url && (
                          <a
                            href={`/api/download-receipt?receiptNumber=${tx.receipt_number}`}
                            download={tx.receipt_number ? `receipt-${tx.receipt_number}.png` : undefined}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-orange-500/20 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 transition-colors hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/35"
                          >
                            <Download size={14} /> Receipt
                          </a>
                        )}
                        <button 
                          onClick={() => tx.id && setDeletingId(tx.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete Contribution"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              
              {filteredContributions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-foreground/50">
                    No contributions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Custom Delete Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-sm p-6 relative border-t-4 border-red-500">
            <h3 className="text-xl font-bold mb-2 text-red-500">Confirm Deletion</h3>
            <p className="text-foreground/70 mb-6">Are you sure you want to delete contribution {deletingId}? This action cannot be undone.</p>
            <div className="flex gap-3">
              <Button onClick={() => setDeletingId(null)} variant="outline" className="flex-1">Cancel</Button>
              <Button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

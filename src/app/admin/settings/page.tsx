"use client";

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useData } from '@/context/DataContext';
import { CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings } = useData();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [festivalNameInput, setFestivalNameInput] = useState(settings.festivalName);

  // Sync festival name input when settings load from localStorage
  useEffect(() => {
    setFestivalNameInput(settings.festivalName);
  }, [settings.festivalName]);

  const handleToggle = async (key: 'showNamesPublicly' | 'showAmountsPublicly' | 'showExpenditurePublicly' | 'allowReceiptDownload') => {
    setSaveError(null);
    setIsSaving(true);
    const success = await updateSettings({ [key]: !settings[key] });
    setIsSaving(false);

    if (success) {
      showSavedFeedback();
    } else {
      setSaveError('Unable to save this setting right now. Please try again in a few seconds.');
    }
  };

  const handleSaveGeneral = async () => {
    setSaveError(null);
    setIsSaving(true);
    const success = await updateSettings({ festivalName: festivalNameInput.trim() || 'TEAM EGB Ganesha Festival' });
    setIsSaving(false);

    if (success) {
      showSavedFeedback();
    } else {
      setSaveError('Unable to save this setting right now. Please try again in a few seconds.');
    }
  };

  const showSavedFeedback = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button 
      type="button"
      onClick={onToggle}
      disabled={isSaving}
      aria-pressed={enabled}
      aria-label={enabled ? 'Enabled' : 'Disabled'}
      className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${enabled ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}
    >
      <div 
        className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${enabled ? 'left-8' : 'left-1'}`}
      />
    </button>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 md:pb-0">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400">System Settings</h2>
          <p className="text-sm text-foreground/60">Configure public visibility and general app settings.</p>
        </div>
        <div className="flex items-center gap-3">
          {isSaving && (
            <div className="px-4 py-2 rounded-lg text-sm font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
              Saving...
            </div>
          )}
          {saved && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium">
              <CheckCircle2 size={16} />
              Settings Saved!
            </div>
          )}
        </div>
      </div>

      {saveError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          {saveError}
        </div>
      )}

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4 border-b border-border-color pb-2">Public Visibility Controls</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Show Contributor Names</p>
              <p className="text-sm text-foreground/60">If disabled, all contributors will appear as &apos;Anonymous&apos;. Phone numbers are always hidden.</p>
            </div>
            <ToggleSwitch enabled={settings.showNamesPublicly} onToggle={() => handleToggle('showNamesPublicly')} />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Show Exact Amounts</p>
              <p className="text-sm text-foreground/60">If enabled, the public can see how much each person contributed.</p>
            </div>
            <ToggleSwitch enabled={settings.showAmountsPublicly} onToggle={() => handleToggle('showAmountsPublicly')} />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Show Expenditure Transparently</p>
              <p className="text-sm text-foreground/60">Allow the public to view the breakdown of festival expenses.</p>
            </div>
            <ToggleSwitch enabled={settings.showExpenditurePublicly} onToggle={() => handleToggle('showExpenditurePublicly')} />
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4 border-b border-border-color pb-2">E-Receipt Controls</h3>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">Allow E-Receipt Download</p>
            <p className="text-sm text-foreground/60">Turn this on to let users download e-receipts. When disabled, users will see: &quot;Our EGB developers are currently working on this feature and it will be available very soon.&quot;</p>
          </div>
          <ToggleSwitch enabled={settings.allowReceiptDownload} onToggle={() => handleToggle('allowReceiptDownload')} />
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4 border-b border-border-color pb-2">General Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Festival Name</label>
            <input 
              type="text" 
              value={festivalNameInput}
              onChange={(e) => setFestivalNameInput(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-background border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <Button onClick={handleSaveGeneral} className="mt-4" disabled={isSaving}>Save General Settings</Button>
        </div>
      </GlassCard>
    </div>
  );
}

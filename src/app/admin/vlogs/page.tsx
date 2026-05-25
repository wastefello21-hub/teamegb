"use client";

import React, { useState } from 'react';

export default function AdminVlogsPage() {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/create-vlog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtube_url: url, title, description, is_public: isPublic })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to save');
      setTitle(''); setUrl(''); setDescription('');
      alert('Vlog added');
    } catch (err: any) {
      alert(err.message || 'Failed to save vlog');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Manage Vlogs</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-md bg-input" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">YouTube URL</label>
          <input value={url} onChange={e => setUrl(e.target.value)} className="w-full px-3 py-2 rounded-md bg-input" placeholder="https://www.youtube.com/watch?v=..." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 rounded-md bg-input" rows={3} />
        </div>
        <div className="flex items-center gap-3">
          <input id="isPublic" type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
          <label htmlFor="isPublic" className="text-sm">Public</label>
        </div>
        <div>
          <button type="submit" disabled={isSaving} className="px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-500">
            {isSaving ? 'Saving...' : 'Add Vlog'}
          </button>
        </div>
      </form>
    </div>
  );
}

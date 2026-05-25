"use client";

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Trash2, Video } from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function AdminVlogsPage() {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteBusyId, setDeleteBusyId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const { vlogs, deleteVlog } = useData();

  const sortedVlogs = useMemo(
    () => [...(vlogs || [])].sort((a, b) => {
      const left = new Date(b.created_at || b.published_at || 0).getTime();
      const right = new Date(a.created_at || a.published_at || 0).getTime();
      return left - right;
    }),
    [vlogs]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/admin/create-vlog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtube_url: url, title, description, is_public: isPublic })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to save');
      setTitle(''); setUrl(''); setDescription('');
      setStatusMessage('Vlog added successfully.');
    } catch (err: any) {
      setStatusMessage(err.message || 'Failed to save vlog');
    } finally {
      setIsSaving(false);
    }
  };

  const getYouTubeId = (videoUrl: string) => {
    try {
      const parsedUrl = new URL(videoUrl.trim());
      const host = parsedUrl.hostname.replace(/^www\./, '');

      if (host === 'youtu.be') {
        const shortId = parsedUrl.pathname.split('/').filter(Boolean)[0];
        return shortId && shortId.length === 11 ? shortId : null;
      }

      if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
        const pathParts = parsedUrl.pathname.split('/').filter(Boolean);

        if (parsedUrl.pathname === '/watch') {
          const watchId = parsedUrl.searchParams.get('v');
          return watchId && watchId.length === 11 ? watchId : null;
        }

        if (pathParts[0] === 'shorts' || pathParts[0] === 'embed' || pathParts[0] === 'live' || pathParts[0] === 'v') {
          const pathId = pathParts[1];
          return pathId && pathId.length === 11 ? pathId : null;
        }
      }

      return null;
    } catch {
      return null;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this vlog? This action cannot be undone.')) {
      return;
    }

    setDeleteBusyId(id);
    setStatusMessage(null);
    try {
      await deleteVlog(id);
      setStatusMessage('Vlog deleted successfully.');
    } catch (error) {
      setStatusMessage('Failed to delete vlog. Please try again.');
    } finally {
      setDeleteBusyId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Manage Vlogs</h1>
        <p className="text-sm text-foreground/60">Upload YouTube videos or Shorts and manage what appears in the public gallery.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] items-start">
        <div className="rounded-2xl border border-border-color bg-background/60 p-5 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-md bg-input border border-border-color" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">YouTube URL</label>
              <input value={url} onChange={e => setUrl(e.target.value)} className="w-full px-3 py-2 rounded-md bg-input border border-border-color" placeholder="https://www.youtube.com/watch?v=... or https://www.youtube.com/shorts/..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 rounded-md bg-input border border-border-color" rows={3} />
            </div>
            <div className="flex items-center gap-3">
              <input id="isPublic" type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
              <label htmlFor="isPublic" className="text-sm">Public</label>
            </div>
            {statusMessage && (
              <div className="rounded-lg border border-border-color bg-foreground/5 px-3 py-2 text-sm text-foreground/75">
                {statusMessage}
              </div>
            )}
            <div>
              <button type="submit" disabled={isSaving} className="px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-500 disabled:opacity-60">
                {isSaving ? 'Saving...' : 'Add Vlog'}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Uploaded Vlogs</h2>
            <span className="text-sm text-foreground/60">{sortedVlogs.length} total</span>
          </div>

          {sortedVlogs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-color bg-background/40 p-8 text-center text-foreground/60">
              <Video className="mx-auto mb-3 h-10 w-10 text-orange-500/60" />
              No vlogs uploaded yet.
            </div>
          ) : (
            <div className="grid gap-4">
              {sortedVlogs.map(vlog => {
                const videoId = getYouTubeId(vlog.youtube_url);
                const thumbnail = vlog.thumbnail_url || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '/logo_v2.jpg');
                const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : vlog.youtube_url;

                return (
                  <div key={vlog.id} className="overflow-hidden rounded-2xl border border-border-color bg-background/60 shadow-sm">
                    <div className="grid gap-0 sm:grid-cols-[180px_1fr]">
                      <div className="relative min-h-[140px] bg-black/10">
                        <Image src={thumbnail} alt={vlog.title || 'Vlog thumbnail'} fill className="object-cover" />
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base font-bold leading-snug">{vlog.title || 'Untitled vlog'}</h3>
                            <p className="mt-1 text-sm text-foreground/60 line-clamp-2">{vlog.description || 'No description provided.'}</p>
                          </div>
                          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${vlog.is_public !== false ? 'bg-green-500/15 text-green-700 dark:text-green-300' : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'}`}>
                            {vlog.is_public !== false ? 'Public' : 'Hidden'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/60">
                          <span>Created: {vlog.created_at ? new Date(vlog.created_at).toLocaleString() : 'Unknown'}</span>
                          <span className="hidden sm:inline">•</span>
                          <a href={watchUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-orange-600 hover:underline">
                            Open video <ExternalLink size={12} />
                          </a>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleDelete(vlog.id)}
                            disabled={deleteBusyId === vlog.id}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-500/15 disabled:opacity-60"
                          >
                            <Trash2 size={14} /> {deleteBusyId === vlog.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

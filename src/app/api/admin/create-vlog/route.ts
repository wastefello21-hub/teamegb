import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

const getYouTubeId = (url: string) => {
  try {
    const parsedUrl = new URL(url.trim());
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

export async function POST(request: Request) {
  const body = await request.json();
  const { youtube_url, title, description, is_public } = body || {};

  if (!youtube_url || typeof youtube_url !== 'string') {
    return NextResponse.json({ error: 'youtube_url is required' }, { status: 400 });
  }

  const videoId = getYouTubeId(youtube_url);
  if (!videoId) return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });

  const thumbnail_url = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  // Prefer the admin client when available, but fall back to the anon client so
  // local/dev environments without SUPABASE_SERVICE_ROLE_KEY still work.
  const db = supabaseAdmin || supabase;

  const { data, error } = await db
    .from('vlogs')
    .insert([{ youtube_url, title, description, thumbnail_url, is_public: !!is_public }])
    .select()
    .single();

  if (error) {
    console.error('create-vlog error:', error.message || error);
    return NextResponse.json({ error: error.message || 'Failed to insert vlog' }, { status: 500 });
  }

  return NextResponse.json({ vlog: data }, { status: 201 });
}

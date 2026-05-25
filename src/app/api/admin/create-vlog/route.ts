import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export async function POST(request: Request) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });

  const body = await request.json();
  const { youtube_url, title, description, is_public } = body || {};

  if (!youtube_url || typeof youtube_url !== 'string') {
    return NextResponse.json({ error: 'youtube_url is required' }, { status: 400 });
  }

  const videoId = getYouTubeId(youtube_url);
  if (!videoId) return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });

  const thumbnail_url = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  const { data, error } = await supabaseAdmin
    .from('vlogs')
    .insert([{ youtube_url, title, description, thumbnail_url, is_public: !!is_public }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ vlog: data }, { status: 201 });
}

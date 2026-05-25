import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import os from 'os';
import path from 'path';
import stream from 'stream';
import { promisify } from 'util';

const pipeline = promisify(stream.pipeline as any);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mediaId, sourceUrl, mediaType } = body;
    if (!mediaId || !sourceUrl) {
      return NextResponse.json({ error: 'mediaId and sourceUrl required' }, { status: 400 });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jiqztujpobafjvoukflt.supabase.co';
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SERVICE_ROLE) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured in env' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

    // Temporary file paths
    const tmpDir = os.tmpdir();
    const tmpImagePath = path.join(tmpDir, `thumb-src-${mediaId}-${Date.now()}`);

    let imageBuffer: Buffer | null = null;

    // Helper to fetch remote url to buffer
    async function fetchToBuffer(url: string) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    }

    if (mediaType === 'youtube' || sourceUrl.match(/\.(jpg|jpeg|png|webp)$/i)) {
      // Image-based source (YouTube thumbnail or direct image)
      const buffer = await fetchToBuffer(sourceUrl);
      imageBuffer = buffer;
    } else {
      // Assume video file: download and extract a frame using ffmpeg
      const tmpVideoPath = `${tmpImagePath}.video`;
      const res = await fetch(sourceUrl);
      if (!res.body) throw new Error('No response body when fetching video');
      const dest = fs.createWriteStream(tmpVideoPath);
      await pipeline(res.body as any, dest);

      // Lazy-load ffmpeg libs to avoid bundling issues when not used
      const ffmpegPathModule = await import('ffmpeg-static');
      const ffmpegModule = await import('fluent-ffmpeg');
      const ffmpegPath = ffmpegPathModule.default || ffmpegPathModule;
      const ffmpeg = (ffmpegModule as any).default || ffmpegModule;
      ffmpeg.setFfmpegPath(ffmpegPath);

      const framePath = `${tmpImagePath}-frame.jpg`;

      await new Promise((resolve, reject) => {
        ffmpeg(tmpVideoPath)
          .screenshots({ count: 1, timemarks: ['1'], filename: path.basename(framePath), folder: path.dirname(framePath), size: '1280x?' })
          .on('end', resolve)
          .on('error', reject);
      });

      // read the frame
      imageBuffer = fs.readFileSync(framePath);

      // cleanup video and frame files
      try { fs.unlinkSync(tmpVideoPath); } catch (e) { /* ignore */ }
      try { fs.unlinkSync(framePath); } catch (e) { /* ignore */ }
    }

    if (!imageBuffer) throw new Error('Failed to generate image buffer');

    // Process with sharp to crop/resize to 4:5 (width x height)
    const sharpModule = await import('sharp');
    const sharp = sharpModule.default;
    const targetWidth = 1200; // high-res thumbnail width
    const targetHeight = Math.round((targetWidth / 4) * 5); // 4:5 -> height

    const processed = await sharp(imageBuffer)
      .rotate()
      .resize(targetWidth, targetHeight, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Create a small LQIP blurDataURL
    const lqip = await sharp(processed).resize(20).blur().jpeg({ quality: 40 }).toBuffer();
    const blurDataURL = `data:image/jpeg;base64,${lqip.toString('base64')}`;

    // Upload to Supabase storage (bucket: thumbnails). Ensure the bucket exists.
    const filename = `thumbnails/${mediaId}.jpg`;
    const { error: uploadError } = await supabase.storage.from('thumbnails').upload(filename, processed, { contentType: 'image/jpeg', upsert: true });
    if (uploadError) {
      console.error('Supabase upload error', uploadError);
      return NextResponse.json({ error: 'Failed to upload thumbnail to storage', details: uploadError }, { status: 500 });
    }

    const { data: publicData } = supabase.storage.from('thumbnails').getPublicUrl(filename as string);
    const publicUrl = publicData.publicUrl;

    // Update gallery record (best-effort)
    try {
      await supabase.from('gallery').update({ thumbnail_url: publicUrl, blur_data_url: blurDataURL }).eq('id', mediaId);
    } catch (e) {
      // ignore DB update errors but log
      console.warn('DB update failed', e);
    }

    return NextResponse.json({ thumbnailUrl: publicUrl, blurDataURL });
  } catch (err: any) {
    console.error('generate-thumbnail error', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

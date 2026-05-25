-- Migration: create vlogs table

CREATE TABLE IF NOT EXISTS public.vlogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  youtube_url text NOT NULL,
  description text,
  thumbnail_url text,
  is_public boolean DEFAULT true,
  published_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vlogs_youtube_idx ON public.vlogs (youtube_url);
CREATE INDEX IF NOT EXISTS vlogs_created_idx ON public.vlogs (created_at DESC);

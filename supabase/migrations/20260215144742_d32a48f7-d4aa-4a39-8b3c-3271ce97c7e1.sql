-- Add new content types for jingles
ALTER TYPE public.content_type ADD VALUE IF NOT EXISTS 'jingle_news';
ALTER TYPE public.content_type ADD VALUE IF NOT EXISTS 'jingle_talk';
ALTER TYPE public.content_type ADD VALUE IF NOT EXISTS 'jingle_podcast';
ALTER TYPE public.content_type ADD VALUE IF NOT EXISTS 'station_id';
ALTER TYPE public.content_type ADD VALUE IF NOT EXISTS 'promo';
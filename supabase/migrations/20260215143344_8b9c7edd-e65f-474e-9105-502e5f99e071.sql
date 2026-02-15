
-- Add cover image and underscore columns to content_items
ALTER TABLE public.content_items 
  ADD COLUMN cover_image_url text,
  ADD COLUMN underscore_url text;

-- Create covers storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true);

-- Storage policies for covers bucket
CREATE POLICY "Cover images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'covers');

CREATE POLICY "Users can upload their own covers"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own covers"
ON storage.objects FOR UPDATE
USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own covers"
ON storage.objects FOR DELETE
USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create underscore storage bucket for background music
INSERT INTO storage.buckets (id, name, public) VALUES ('underscore', 'underscore', true);

CREATE POLICY "Underscore files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'underscore');

CREATE POLICY "Users can upload underscore files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'underscore' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update underscore files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'underscore' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete underscore files"
ON storage.objects FOR DELETE
USING (bucket_id = 'underscore' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Radio settings table for default covers and underscore
CREATE TABLE public.radio_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  setting_key text NOT NULL,
  setting_value text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, setting_key)
);

ALTER TABLE public.radio_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
ON public.radio_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
ON public.radio_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
ON public.radio_settings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
ON public.radio_settings FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_radio_settings_updated_at
BEFORE UPDATE ON public.radio_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


ALTER TABLE public.templates ADD COLUMN slots JSONB DEFAULT '[]'::jsonb;

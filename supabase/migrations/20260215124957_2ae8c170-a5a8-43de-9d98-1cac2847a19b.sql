
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Content type enum
CREATE TYPE public.content_type AS ENUM ('news', 'music', 'podcast', 'talk');

-- Content items table
CREATE TABLE public.content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type content_type NOT NULL,
  artist TEXT,
  duration TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  file_url TEXT,
  external_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Schedule entries table
CREATE TABLE public.schedule_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES public.content_items(id) ON DELETE CASCADE NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 5,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_rule TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Templates table
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  content_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Content items policies
CREATE POLICY "Users can view all active content" ON public.content_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own content" ON public.content_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own content" ON public.content_items FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own content" ON public.content_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Schedule entries policies
CREATE POLICY "Users can view all schedule" ON public.schedule_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own schedule" ON public.schedule_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own schedule" ON public.schedule_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own schedule" ON public.schedule_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Templates policies
CREATE POLICY "Users can view all templates" ON public.templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own templates" ON public.templates FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON public.templates FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON public.templates FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_items_updated_at BEFORE UPDATE ON public.content_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) VALUES ('audio', 'audio', true);

CREATE POLICY "Authenticated users can upload audio" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Anyone can view audio" ON storage.objects FOR SELECT USING (bucket_id = 'audio');
CREATE POLICY "Users can delete own audio" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]);

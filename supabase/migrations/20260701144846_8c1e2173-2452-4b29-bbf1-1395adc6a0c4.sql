
-- 1. content_items: restrict SELECT to owner
DROP POLICY IF EXISTS "Users can view all active content" ON public.content_items;
CREATE POLICY "Users can view own content"
ON public.content_items FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 2. schedule_entries: restrict SELECT to owner
DROP POLICY IF EXISTS "Users can view all schedule" ON public.schedule_entries;
CREATE POLICY "Users can view own schedule"
ON public.schedule_entries FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 3 & 6. schedule_slots: move all policies to authenticated + owner
DROP POLICY IF EXISTS "Users can view all schedule slots" ON public.schedule_slots;
DROP POLICY IF EXISTS "Users can insert own schedule slots" ON public.schedule_slots;
DROP POLICY IF EXISTS "Users can update own schedule slots" ON public.schedule_slots;
DROP POLICY IF EXISTS "Users can delete own schedule slots" ON public.schedule_slots;

CREATE POLICY "Users can view own schedule slots"
ON public.schedule_slots FOR SELECT TO authenticated
USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own schedule slots"
ON public.schedule_slots FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own schedule slots"
ON public.schedule_slots FOR UPDATE TO authenticated
USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own schedule slots"
ON public.schedule_slots FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- 4. templates: restrict SELECT to owner
DROP POLICY IF EXISTS "Users can view all templates" ON public.templates;
CREATE POLICY "Users can view own templates"
ON public.templates FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 5. audio bucket: add UPDATE policy scoped to owner
CREATE POLICY "Users can update own audio"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'audio' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- 10. Public bucket listing: restrict SELECT on storage.objects to owners
-- (public playback still works via public object URLs, which bypass RLS)
DROP POLICY IF EXISTS "Anyone can view audio" ON storage.objects;
DROP POLICY IF EXISTS "Cover images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Underscore files are publicly accessible" ON storage.objects;

CREATE POLICY "Users can list own audio"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'audio' AND (auth.uid())::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can list own covers"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'covers' AND (auth.uid())::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can list own underscore"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'underscore' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- 7 & 9. SECURITY DEFINER functions: revoke direct API execute access
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

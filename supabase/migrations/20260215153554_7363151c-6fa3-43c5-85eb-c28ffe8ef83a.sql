
-- Schedule slots: assign templates to day/hour combinations
CREATE TABLE public.schedule_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday
  start_hour INTEGER NOT NULL CHECK (start_hour >= 0 AND start_hour <= 23),
  end_hour INTEGER NOT NULL CHECK (end_hour >= 1 AND end_hour <= 24),
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.schedule_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all schedule slots" ON public.schedule_slots FOR SELECT USING (true);
CREATE POLICY "Users can insert own schedule slots" ON public.schedule_slots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own schedule slots" ON public.schedule_slots FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own schedule slots" ON public.schedule_slots FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_schedule_slots_day ON public.schedule_slots(day_of_week, start_hour);

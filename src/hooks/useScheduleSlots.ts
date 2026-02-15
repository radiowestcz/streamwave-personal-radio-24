import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ScheduleSlot {
  id: string;
  user_id: string;
  day_of_week: number; // 0=Sunday
  start_hour: number;
  end_hour: number;
  template_id: string;
  created_at: string;
  // joined
  template?: {
    id: string;
    name: string;
    description: string | null;
    slots: any[];
  };
}

export const useScheduleSlots = () => {
  return useQuery({
    queryKey: ['schedule_slots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedule_slots')
        .select('*, templates(id, name, description, slots)')
        .order('day_of_week')
        .order('start_hour');
      if (error) throw error;
      return (data || []).map((row: any) => ({
        ...row,
        template: row.templates,
      })) as ScheduleSlot[];
    },
  });
};

export const useCreateScheduleSlot = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (slot: { day_of_week: number; start_hour: number; end_hour: number; template_id: string }) => {
      const { data, error } = await supabase
        .from('schedule_slots')
        .insert({ ...slot, user_id: user!.id })
        .select('*, templates(id, name, description, slots)')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule_slots'] });
      toast.success('Slot přidán do rozvrhu');
    },
    onError: (e: Error) => toast.error('Chyba: ' + e.message),
  });
};

export const useDeleteScheduleSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('schedule_slots').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule_slots'] });
      toast.success('Slot odebrán');
    },
    onError: (e: Error) => toast.error('Chyba: ' + e.message),
  });
};

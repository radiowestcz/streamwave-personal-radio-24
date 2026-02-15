import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { ContentType } from './useContentItems';

export interface TemplateSlot {
  id: string;
  time: string;
  contentType: ContentType;
  duration: string;
  contentId?: string | null; // manual override
  filters?: {
    categories?: string[];
    tags?: string[];
  };
}

export interface Template {
  id: string;
  name: string;
  description: string | null;
  slots: TemplateSlot[];
  content_ids: string[] | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useTemplates = () => {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((row: any) => ({
        ...row,
        slots: Array.isArray(row.slots) ? row.slots : [],
      })) as Template[];
    },
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (item: { name: string; description?: string; slots?: TemplateSlot[] }) => {
      const { data, error } = await supabase
        .from('templates')
        .insert({
          name: item.name,
          description: item.description || null,
          slots: (item.slots || []) as any,
          user_id: user!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Šablona vytvořena');
    },
    onError: (error: Error) => {
      toast.error('Nepodařilo se vytvořit šablonu: ' + error.message);
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; description?: string; slots?: TemplateSlot[] }) => {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.slots !== undefined) payload.slots = updates.slots;
      const { data, error } = await supabase
        .from('templates')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Šablona aktualizována');
    },
    onError: (error: Error) => {
      toast.error('Nepodařilo se aktualizovat: ' + error.message);
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Šablona smazána');
    },
    onError: (error: Error) => {
      toast.error('Nepodařilo se smazat: ' + error.message);
    },
  });
};

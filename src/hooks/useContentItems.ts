import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type ContentType = 'news' | 'music' | 'podcast' | 'talk';

export interface ContentItem {
  id: string;
  user_id: string;
  title: string;
  type: ContentType;
  artist: string | null;
  duration: string | null;
  tags: string[];
  is_active: boolean;
  file_url: string | null;
  external_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useContentItems = (typeFilter?: ContentType) => {
  return useQuery({
    queryKey: ['content_items', typeFilter],
    queryFn: async () => {
      let query = supabase.from('content_items').select('*').order('created_at', { ascending: false });
      if (typeFilter) {
        query = query.eq('type', typeFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as ContentItem[];
    },
  });
};

export const useCreateContent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (item: {
      title: string;
      type: ContentType;
      artist?: string;
      duration?: string;
      tags?: string[];
      file_url?: string;
      external_url?: string;
    }) => {
      const { data, error } = await supabase.from('content_items').insert({
        ...item,
        user_id: user!.id,
        tags: item.tags || [],
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content_items'] });
      toast.success('Content created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create content: ' + error.message);
    },
  });
};

export const useUpdateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContentItem> & { id: string }) => {
      const { data, error } = await supabase.from('content_items').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content_items'] });
      toast.success('Content updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update: ' + error.message);
    },
  });
};

export const useDeleteContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('content_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content_items'] });
      toast.success('Content deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete: ' + error.message);
    },
  });
};

export const useUploadAudio = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      const filePath = `${user!.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('audio').upload(filePath, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('audio').getPublicUrl(filePath);
      return publicUrl;
    },
    onError: (error: Error) => {
      toast.error('Upload failed: ' + error.message);
    },
  });
};


import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useTherapists = () => {
  return useQuery({
    queryKey: ['therapists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('therapists')
        .select('*')
        .order('rating', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

export const useTherapistById = (id: string) => {
  return useQuery({
    queryKey: ['therapist', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('therapists')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Composition {
  id: string;
  status: string;
  type: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  category?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  subject: {
    reference: string;
    display?: string;
  };
  author?: Array<{
    reference: string;
    display?: string;
  }>;
  title: string;
  date?: string;
  section?: Array<{
    title?: string;
    code?: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
    text?: {
      status: string;
      div: string;
    };
  }>;
}

interface CompositionSearchResponse {
  entry?: Array<{
    resource: Composition;
  }>;
  total?: number;
}

export const useCompositions = (searchParams?: Record<string, string>) => {
  return useQuery({
    queryKey: ['compositions', searchParams],
    queryFn: async (): Promise<Composition[]> => {
      const params = new URLSearchParams(searchParams);
      const response = await fetch(`/api/compositions?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch compositions');
      }

      const data: CompositionSearchResponse = await response.json();
      return data.entry?.map(entry => entry.resource) || [];
    },
    enabled: !!searchParams,
  });
};

export const useComposition = (compositionId: string) => {
  return useQuery({
    queryKey: ['composition', compositionId],
    queryFn: async (): Promise<Composition> => {
      const response = await fetch(`/api/compositions/${compositionId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch composition');
      }

      return response.json();
    },
    enabled: !!compositionId,
  });
};

export const useCreateComposition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Composition>) => {
      const response = await fetch('/api/compositions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create composition');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compositions'] });
    },
  });
};

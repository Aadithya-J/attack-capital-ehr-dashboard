import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Condition {
  id: string;
  clinicalStatus?: {
    coding: Array<{
      code: string;
      display: string;
    }>;
  };
  verificationStatus?: {
    coding: Array<{
      code: string;
      display: string;
    }>;
  };
  code?: {
    coding: Array<{
      code: string;
      display: string;
      system?: string;
    }>;
    text?: string;
  };
  subject: {
    reference: string;
    display?: string;
  };
  onsetDateTime?: string;
  recordedDate?: string;
  recorder?: {
    reference: string;
    display?: string;
  };
  severity?: {
    coding: Array<{
      code: string;
      display: string;
    }>;
  };
  note?: Array<{
    text: string;
  }>;
}

interface ConditionSearchResponse {
  entry?: Array<{
    resource: Condition;
  }>;
  total?: number;
}

export const useConditions = (searchParams?: Record<string, string>) => {
  return useQuery({
    queryKey: ['conditions', searchParams],
    queryFn: async (): Promise<Condition[]> => {
      const params = new URLSearchParams(searchParams);
      const response = await fetch(`/api/conditions?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch conditions');
      }
      
      const data: ConditionSearchResponse = await response.json();
      return data.entry?.map(entry => entry.resource) || [];
    },
    enabled: !!searchParams,
  });
};

export const useCondition = (conditionId: string) => {
  return useQuery({
    queryKey: ['condition', conditionId],
    queryFn: async (): Promise<Condition> => {
      const response = await fetch(`/api/conditions/${conditionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch condition');
      }
      
      return response.json();
    },
    enabled: !!conditionId,
  });
};

export const useCreateCondition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Condition>) => {
      const response = await fetch('/api/conditions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create condition');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conditions'] });
    },
  });
};

export const useUpdateCondition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ conditionId, data }: { conditionId: string; data: Partial<Condition> }) => {
      const response = await fetch(`/api/conditions/${conditionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update condition');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conditions'] });
      queryClient.invalidateQueries({ queryKey: ['condition', variables.conditionId] });
    },
  });
};

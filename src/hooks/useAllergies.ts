import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Allergy {
  id: string;
  clinicalStatus?: {
    coding?: Array<{
      code: string;
      display: string;
    }>;
  };
  verificationStatus?: {
    coding?: Array<{
      code: string;
      display: string;
    }>;
  };
  type?: string;
  category?: Array<string>;
  criticality?: string;
  code?: {
    coding?: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };
  patient: {
    reference: string;
    display?: string;
  };
  onsetDateTime?: string;
  recordedDate?: string;
  reaction?: Array<{
    substance?: {
      coding?: Array<{
        code: string;
        display: string;
      }>;
    };
    manifestation: Array<{
      coding?: Array<{
        code: string;
        display: string;
      }>;
      text: string;
    }>;
    severity?: string;
  }>;
  note?: Array<{
    text: string;
  }>;
}

interface AllergySearchResponse {
  entry?: Array<{
    resource: Allergy;
  }>;
  total?: number;
}

export const useAllergies = (searchParams?: Record<string, string>) => {
  return useQuery({
    queryKey: ['allergies', searchParams],
    queryFn: async (): Promise<Allergy[]> => {
      const params = new URLSearchParams(searchParams);
      const response = await fetch(`/api/allergies?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch allergies');
      }

      const data: AllergySearchResponse = await response.json();
      return data.entry?.map(entry => entry.resource) || [];
    },
    enabled: !!searchParams,
  });
};

export const useAllergy = (allergyId: string) => {
  return useQuery({
    queryKey: ['allergy', allergyId],
    queryFn: async (): Promise<Allergy> => {
      const response = await fetch(`/api/allergies/${allergyId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch allergy');
      }

      return response.json();
    },
    enabled: !!allergyId,
  });
};

export const useCreateAllergy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Allergy>) => {
      const response = await fetch('/api/allergies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create allergy');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allergies'] });
    },
  });
};

export const useUpdateAllergy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ allergyId, data }: { allergyId: string; data: Partial<Allergy> }) => {
      const response = await fetch(`/api/allergies/${allergyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update allergy');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allergies'] });
      queryClient.invalidateQueries({ queryKey: ['allergy', variables.allergyId] });
    },
  });
};

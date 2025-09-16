import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Medication {
  id: string;
  status: string;
  medicationCodeableConcept: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };
  subject: {
    reference: string;
    display?: string;
  };
  effectivePeriod?: {
    start: string;
    end?: string;
  };
  dosage?: Array<{
    text: string;
    doseAndRate?: {
      doseQuantity?: {
        value: number;
        unit: string;
      };
    };
    timing?: {
      code?: {
        coding?: Array<{
          code: string;
          display: string;
        }>;
      };
    };
  }>;
  dateAsserted?: string;
}

interface MedicationSearchResponse {
  entry?: Array<{
    resource: Medication;
  }>;
  total?: number;
}

export const useMedications = (searchParams?: Record<string, string>) => {
  return useQuery({
    queryKey: ['medications', searchParams],
    queryFn: async (): Promise<Medication[]> => {
      const params = new URLSearchParams(searchParams);
      const response = await fetch(`/api/medications?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch medications');
      }

      const data: MedicationSearchResponse = await response.json();
      return data.entry?.map(entry => entry.resource) || [];
    },
    enabled: !!searchParams,
  });
};

export const useMedication = (medicationId: string) => {
  return useQuery({
    queryKey: ['medication', medicationId],
    queryFn: async (): Promise<Medication> => {
      const response = await fetch(`/api/medications/${medicationId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch medication');
      }

      return response.json();
    },
    enabled: !!medicationId,
  });
};

export const useCreateMedication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Medication>) => {
      const response = await fetch('/api/medications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create medication');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });
};

export const useUpdateMedication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ medicationId, data }: { medicationId: string; data: Partial<Medication> }) => {
      const response = await fetch(`/api/medications/${medicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update medication');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      queryClient.invalidateQueries({ queryKey: ['medication', variables.medicationId] });
    },
  });
};

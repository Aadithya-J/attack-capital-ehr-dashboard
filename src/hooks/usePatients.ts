"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Patient {
  id: string;
  name: Array<{
    given: string[];
    family: string;
  }>;
  gender: string;
  birthDate: string;
  telecom?: Array<{
    system: string;
    value: string;
  }>;
  address?: Array<{
    line: string[];
    city: string;
    state: string;
    postalCode: string;
  }>;
}

interface PatientSearchResponse {
  entry?: Array<{
    resource: Patient;
  }>;
  total?: number;
}

export const usePatients = (searchParams?: Record<string, string>) => {
  return useQuery({
    queryKey: ['patients', searchParams],
    queryFn: async (): Promise<Patient[]> => {
      const params = new URLSearchParams(searchParams || {});
      const response = await fetch(`/api/patients?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }
      
      const data: PatientSearchResponse = await response.json();
      return data.entry?.map(entry => entry.resource) || [];
    },
  });
};

export const usePatient = (patientId: string) => {
  return useQuery({
    queryKey: ['patient', patientId],
    queryFn: async (): Promise<Patient> => {
      const response = await fetch(`/api/patients/${patientId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch patient');
      }
      
      return response.json();
    },
    enabled: !!patientId,
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ patientId, data }: { patientId: string; data: Partial<Patient> }) => {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update patient');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient', variables.patientId] });
    },
  });
};

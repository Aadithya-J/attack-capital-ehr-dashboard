import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Appointment {
  id: string;
  status: string;
  start: string;
  end: string;
  participant: Array<{
    actor: {
      reference: string;
      display: string;
    };
    status: string;
  }>;
  appointmentType?: {
    coding: Array<{
      code: string;
      display: string;
    }>;
  };
}

interface AppointmentSearchResponse {
  entry?: Array<{
    resource: Appointment;
  }>;
  total?: number;
}

export const useAppointments = (searchParams?: Record<string, string>) => {
  return useQuery({
    queryKey: ['appointments', searchParams],
    queryFn: async (): Promise<Appointment[]> => {
      const params = new URLSearchParams(searchParams);
      const response = await fetch(`/api/appointments?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      
      const data: AppointmentSearchResponse = await response.json();
      return data.entry?.map(entry => entry.resource) || [];
    },
    enabled: !!searchParams,
  });
};

export const useAppointment = (appointmentId: string) => {
  return useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: async (): Promise<Appointment> => {
      const response = await fetch(`/api/appointments/${appointmentId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointment');
      }
      
      return response.json();
    },
    enabled: !!appointmentId,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Appointment>) => {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create appointment');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ appointmentId, data }: { appointmentId: string; data: Partial<Appointment> }) => {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.appointmentId] });
    },
  });
};

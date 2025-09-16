import { useQuery } from '@tanstack/react-query';

interface Slot {
  id: string;
  start: string;
  end: string;
  status: string;
  serviceType?: Array<{
    coding: Array<{
      code: string;
      display: string;
    }>;
  }>;
}

interface SlotsResponse {
  entry?: Array<{
    resource: Slot;
  }>;
  total?: number;
}

export const useSlots = (params: {
  appointmentType?: string;
  practitionerId?: string;
  locationId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['slots', params],
    queryFn: async (): Promise<Slot[]> => {
      const searchParams = new URLSearchParams();
      
      if (params.appointmentType) {
        searchParams.append('appointment-type', params.appointmentType);
      }
      
      if (params.practitionerId) {
        searchParams.append('identifier', `http://www.hl7.org/fhir/v2/0203/index.html#v2-0203-PRN|${params.practitionerId}`);
      }
      
      if (params.locationId) {
        searchParams.append('identifier', `http://www.hl7.org/fhir/v2/0203/index.html#v2-0203-FI|${params.locationId}`);
      }
      
      if (params.startDate) {
        searchParams.append('date', `ge${params.startDate}`);
      }
      
      if (params.endDate) {
        searchParams.append('date', `le${params.endDate}`);
      }
      
      const response = await fetch(`/api/slots?${searchParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch slots');
      }
      
      const data: SlotsResponse = await response.json();
      return data.entry?.map(entry => entry.resource) || [];
    },
    enabled: !!params.appointmentType && (!!params.practitionerId || !!params.locationId) && !!params.startDate,
  });
};

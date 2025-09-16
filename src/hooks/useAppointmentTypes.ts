import { useQuery } from '@tanstack/react-query';

interface AppointmentType {
  code: string;
  display: string;
  system?: string;
}

interface AppointmentTypesResponse {
  resourceType: string;
  id: string;
  compose: {
    include: Array<{
      system: string;
      concept: AppointmentType[];
    }>;
  };
}

export const useAppointmentTypes = () => {
  return useQuery({
    queryKey: ['appointment-types'],
    queryFn: async (): Promise<AppointmentType[]> => {
      const response = await fetch('/api/appointment-types');
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointment types');
      }
      
      const data: AppointmentTypesResponse = await response.json();
      
      // Extract appointment types from the ValueSet structure
      const types: AppointmentType[] = [];
      if (data.compose?.include) {
        data.compose.include.forEach(include => {
          if (include.concept) {
            types.push(...include.concept.map(concept => ({
              ...concept,
              system: include.system
            })));
          }
        });
      }
      
      return types;
    },
  });
};

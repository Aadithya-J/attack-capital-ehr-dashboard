import { useQuery } from '@tanstack/react-query';

interface Location {
  id: string;
  name?: string;
  status?: string;
  address?: {
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
  };
  telecom?: Array<{
    system: string;
    value: string;
  }>;
}

interface LocationsResponse {
  entry?: Array<{
    resource: Location;
  }>;
  total?: number;
}

export const useLocations = () => {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async (): Promise<Location[]> => {
      const response = await fetch('/api/locations');
      
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      
      const data: LocationsResponse = await response.json();
      return data.entry?.map(entry => entry.resource) || [];
    },
  });
};

export const getLocationName = (location: Location): string => {
  return location.name || `Location ${location.id}`;
};

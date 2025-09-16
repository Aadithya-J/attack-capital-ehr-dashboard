import { useQuery } from '@tanstack/react-query';

interface Encounter {
  id: string;
  status: string;
  class: {
    system: string;
    code: string;
    display: string;
  };
  type?: Array<{
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
  participant?: Array<{
    type?: Array<{
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
      text: string;
    }>;
    individual?: {
      reference: string;
      display: string;
    };
  }>;
  period?: {
    start: string;
    end?: string;
  };
  location?: Array<{
    location: {
      reference: string;
      display?: string;
    };
  }>;
  reasonCode?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text?: string;
  }>;
}

interface EncounterSearchResponse {
  entry?: Array<{
    resource: Encounter;
  }>;
  total?: number;
}

export const useEncounters = (searchParams?: Record<string, string>) => {
  return useQuery({
    queryKey: ['encounters', searchParams],
    queryFn: async (): Promise<Encounter[]> => {
      const params = new URLSearchParams(searchParams);
      const response = await fetch(`/api/encounters?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch encounters');
      }

      const data: EncounterSearchResponse = await response.json();
      return data.entry?.map(entry => entry.resource) || [];
    },
    enabled: !!searchParams,
  });
};

export const useEncounter = (encounterId: string) => {
  return useQuery({
    queryKey: ['encounter', encounterId],
    queryFn: async (): Promise<Encounter> => {
      const response = await fetch(`/api/encounters/${encounterId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch encounter');
      }

      return response.json();
    },
    enabled: !!encounterId,
  });
};

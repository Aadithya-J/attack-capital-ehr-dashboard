import { useQuery } from '@tanstack/react-query';

interface Coverage {
  id: string;
  status: string;
  policyHolder?: {
    display?: string;
  };
  beneficiary: {
    reference: string;
    display?: string;
  };
  relationship?: {
    coding?: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text?: string;
  };
  class?: Array<{
    type: {
      coding?: Array<{
        system: string;
        code: string;
        display: string;
      }>;
      text?: string;
    };
    value: string;
  }>;
  order?: number;
}

interface CoverageSearchResponse {
  entry?: Array<{
    resource: Coverage;
  }>;
  total?: number;
}

export const useCoverage = (searchParams?: Record<string, string>) => {
  return useQuery({
    queryKey: ['coverage', searchParams],
    queryFn: async (): Promise<Coverage[]> => {
      const params = new URLSearchParams(searchParams);
      const response = await fetch(`/api/coverage?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch coverage');
      }

      const data: CoverageSearchResponse = await response.json();
      return data.entry?.map(entry => entry.resource) || [];
    },
    enabled: !!searchParams,
  });
};

export const useCoverageItem = (coverageId: string) => {
  return useQuery({
    queryKey: ['coverage', coverageId],
    queryFn: async (): Promise<Coverage> => {
      const response = await fetch(`/api/coverage/${coverageId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch coverage');
      }

      return response.json();
    },
    enabled: !!coverageId,
  });
};

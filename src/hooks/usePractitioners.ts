import { useQuery } from '@tanstack/react-query';

interface Practitioner {
  id: string;
  name?: Array<{
    given?: string[];
    family?: string;
    text?: string;
  }>;
  active?: boolean;
  telecom?: Array<{
    system: string;
    value: string;
  }>;
}

interface PractitionersResponse {
  entry?: Array<{
    resource: Practitioner;
  }>;
  total?: number;
}

export const usePractitioners = () => {
  return useQuery({
    queryKey: ['practitioners'],
    queryFn: async (): Promise<Practitioner[]> => {
      const response = await fetch('/api/practitioners');
      
      if (!response.ok) {
        throw new Error('Failed to fetch practitioners');
      }
      
      const data: PractitionersResponse = await response.json();
      return data.entry?.map(entry => entry.resource) || [];
    },
  });
};

export const getPractitionerName = (practitioner: Practitioner): string => {
  if (practitioner.name && practitioner.name[0]) {
    const name = practitioner.name[0];
    if (name.text) return name.text;
    return `${name.given?.join(' ') || ''} ${name.family || ''}`.trim();
  }
  return `Practitioner ${practitioner.id}`;
};

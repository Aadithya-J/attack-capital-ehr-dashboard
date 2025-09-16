import { useQuery } from '@tanstack/react-query';

interface DiagnosticReport {
  id: string;
  status: string;
  category?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text?: string;
  };
  subject: {
    reference: string;
    display?: string;
  };
  effectiveDateTime?: string;
  issued?: string;
  performer?: Array<{
    reference: string;
    display?: string;
  }>;
  result?: Array<{
    reference: string;
    display?: string;
  }>;
  conclusion?: string;
  conclusionCode?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
}

interface DiagnosticReportSearchResponse {
  entry?: Array<{
    resource: DiagnosticReport;
  }>;
  total?: number;
}

export const useDiagnosticReports = (searchParams?: Record<string, string>) => {
  return useQuery({
    queryKey: ['diagnosticReports', searchParams],
    queryFn: async (): Promise<DiagnosticReport[]> => {
      const params = new URLSearchParams(searchParams);
      const response = await fetch(`/api/diagnostic-reports?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch diagnostic reports');
      }

      const data: DiagnosticReportSearchResponse = await response.json();
      return data.entry?.map(entry => entry.resource) || [];
    },
    enabled: !!searchParams,
  });
};

export const useDiagnosticReport = (reportId: string) => {
  return useQuery({
    queryKey: ['diagnosticReport', reportId],
    queryFn: async (): Promise<DiagnosticReport> => {
      const response = await fetch(`/api/diagnostic-reports/${reportId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch diagnostic report');
      }

      return response.json();
    },
    enabled: !!reportId,
  });
};

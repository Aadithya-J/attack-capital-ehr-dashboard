import { useQuery } from '@tanstack/react-query';

interface Account {
  id: string;
  subject?: Array<{
    reference: string;
    display?: string;
  }>;
  guarantor?: Array<{
    party: {
      reference: string;
      display?: string;
    };
  }>;
  outstandingBalance?: Array<{
    value: number;
    currency: string;
  }>;
  unusedFunds?: Array<{
    value: number;
    currency: string;
  }>;
  businessUnitId?: Array<string>;
  businessUnitName?: Array<string>;
}

interface AccountSearchResponse {
  entry?: Array<{
    resource: Account;
  }>;
  total?: number;
}

export const useAccounts = (searchParams?: Record<string, string>) => {
  return useQuery({
    queryKey: ['accounts', searchParams],
    queryFn: async (): Promise<Account[]> => {
      const params = new URLSearchParams(searchParams);
      const response = await fetch(`/api/accounts?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }

      const data: AccountSearchResponse = await response.json();
      return data.entry?.map(entry => entry.resource) || [];
    },
    enabled: !!searchParams,
  });
};

export const useAccount = (accountId: string) => {
  return useQuery({
    queryKey: ['account', accountId],
    queryFn: async (): Promise<Account> => {
      const response = await fetch(`/api/accounts/${accountId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch account');
      }

      return response.json();
    },
    enabled: !!accountId,
  });
};

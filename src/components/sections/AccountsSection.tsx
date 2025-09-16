'use client';

import { useState } from 'react';
import { useAccounts, useAccount } from '@/hooks/useAccounts';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function AccountsSection() {
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [searchForm, setSearchForm] = useState({
    patientId: ''
  });
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  const { data: accounts, isLoading, error } = useAccounts(searchParams);
  const { data: selectedAccount } = useAccount(selectedAccountId);

  const handleSearch = () => {
    const params: Record<string, string> = {};

    if (searchForm.patientId.trim()) {
      params.patient = searchForm.patientId.trim();
    }

    setSearchParams(params);
  };

  const handleClearSearch = () => {
    setSearchForm({
      patientId: ''
    });
    setSearchParams({});
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Accounts</h2>
      </div>

      <Card title="Search Accounts">
        <div className="grid grid-cols-1 gap-4 max-w-md">
          <Input
            label="Patient ID"
            value={searchForm.patientId}
            placeholder="Enter patient ID (e.g., 256547)"
            onChange={(value) => setSearchForm(prev => ({ ...prev, patientId: value }))}
          />
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={handleSearch}>
            Search Accounts
          </Button>
          <Button variant="secondary" onClick={handleClearSearch}>
            Clear Search
          </Button>
        </div>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error loading accounts: {error.message}</p>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <p>Loading accounts...</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Accounts List</h3>
          <div className="space-y-3">
            {accounts?.map((account) => (
              <Card key={account.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">
                        Account {account.id.slice(-8)}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-800 mb-1">
                      <strong className="text-gray-900">Subject:</strong> {account.subject?.[0]?.display || account.subject?.[0]?.reference}
                    </p>
                    {account.guarantor?.[0] && (
                      <p className="text-sm text-gray-800 mb-1">
                        <strong className="text-gray-900">Guarantor:</strong> {account.guarantor[0].party.display || account.guarantor[0].party.reference}
                      </p>
                    )}
                    {account.outstandingBalance?.[0] && (
                      <p className="text-sm text-gray-800 mb-1">
                        <strong className="text-gray-900">Outstanding Balance:</strong> {formatCurrency(account.outstandingBalance[0].value, account.outstandingBalance[0].currency)}
                      </p>
                    )}
                    {account.unusedFunds?.[0] && (
                      <p className="text-sm text-gray-800 mb-1">
                        <strong className="text-gray-900">Unused Funds:</strong> {formatCurrency(account.unusedFunds[0].value, account.unusedFunds[0].currency)}
                      </p>
                    )}
                    {account.businessUnitName?.[0] && (
                      <p className="text-sm text-gray-800">
                        <strong className="text-gray-900">Business Unit:</strong> {account.businessUnitName[0]}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      onClick={() => setSelectedAccountId(account.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {accounts?.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No accounts found. Try adjusting your search criteria.
              </p>
            )}
          </div>
        </div>

        {selectedAccount && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Account Details</h3>
            <Card>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Basic Information</h4>
                  <p className="text-gray-900"><strong>ID:</strong> {selectedAccount.id}</p>
                </div>

                {selectedAccount.subject && selectedAccount.subject.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Subjects</h4>
                    {selectedAccount.subject.map((subject, index) => (
                      <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                        <p className="text-gray-900">{subject.display || subject.reference}</p>
                      </div>
                    ))}
                  </div>
                )}

                {selectedAccount.guarantor && selectedAccount.guarantor.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Guarantors</h4>
                    {selectedAccount.guarantor.map((guarantor, index) => (
                      <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                        <p className="text-gray-900">{guarantor.party.display || guarantor.party.reference}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Financial Information</h4>
                  {selectedAccount.outstandingBalance?.map((balance, index) => (
                    <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                      <p className="text-gray-900"><strong>Outstanding Balance:</strong> {formatCurrency(balance.value, balance.currency)}</p>
                    </div>
                  ))}
                  {selectedAccount.unusedFunds?.map((funds, index) => (
                    <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                      <p className="text-gray-900"><strong>Unused Funds:</strong> {formatCurrency(funds.value, funds.currency)}</p>
                    </div>
                  ))}
                </div>

                {selectedAccount.businessUnitName && selectedAccount.businessUnitName.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Business Units</h4>
                    {selectedAccount.businessUnitName.map((unit, index) => (
                      <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                        <p className="text-gray-900">{unit}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

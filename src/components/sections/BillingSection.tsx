'use client';

import { useState } from 'react';
import { useCoverage } from '@/hooks/useCoverage';
import { useAccounts } from '@/hooks/useAccounts';
import { usePatients } from '@/hooks/usePatients';
import Card from '@/components/ui/Card';

export default function BillingSection() {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  
  const { data: patients } = usePatients({});
  const { data: coverage } = useCoverage(selectedPatientId ? { patient: selectedPatientId } : undefined);
  const { data: accounts } = useAccounts(selectedPatientId ? { patient: selectedPatientId } : undefined);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getCoverageStatus = (coverage: any) => {
    if (coverage.status === 'active') {
      return { text: 'Active', color: 'bg-green-100 text-green-800' };
    } else if (coverage.status === 'cancelled') {
      return { text: 'Cancelled', color: 'bg-red-100 text-red-800' };
    } else {
      return { text: coverage.status || 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getAccountStatus = (account: any) => {
    if (account.status === 'active') {
      return { text: 'Active', color: 'bg-green-100 text-green-800' };
    } else if (account.status === 'inactive') {
      return { text: 'Inactive', color: 'bg-gray-100 text-gray-800' };
    } else {
      return { text: account.status || 'Unknown', color: 'bg-yellow-100 text-yellow-800' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Billing & Administrative</h2>
      </div>

      {/* Patient Selection */}
      <Card title="Select Patient">
        <div className="text-black">
          <label className="block text-sm font-medium mb-1">Patient *</label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Patient</option>
            {patients?.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name?.[0] ? `${patient.name[0].given?.join(' ') || ''} ${patient.name[0].family || ''}`.trim() || `Patient ${patient.id}` : `Patient ${patient.id}`}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {selectedPatientId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Insurance Coverage Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black">Insurance Coverage & Eligibility</h3>
            
            <div className="space-y-3">
              {coverage?.map((coverageItem: any) => (
                <Card key={coverageItem.id}>
                  <div className="text-black">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-lg">
                        {coverageItem.payor?.[0]?.display || 'Insurance Coverage'}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded ${getCoverageStatus(coverageItem).color}`}>
                        {getCoverageStatus(coverageItem).text}
                      </span>
                    </div>

                    {coverageItem.subscriberId && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Subscriber ID:</strong> {coverageItem.subscriberId}
                      </p>
                    )}

                    {coverageItem.dependent && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Dependent:</strong> {coverageItem.dependent}
                      </p>
                    )}

                    {coverageItem.relationship?.coding?.[0] && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Relationship:</strong> {coverageItem.relationship.coding[0].display}
                      </p>
                    )}

                    {coverageItem.period && (
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Coverage Period:</strong>
                        <div className="ml-2">
                          {coverageItem.period.start && (
                            <p>Start: {formatDate(coverageItem.period.start)}</p>
                          )}
                          {coverageItem.period.end && (
                            <p>End: {formatDate(coverageItem.period.end)}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {coverageItem.class && coverageItem.class.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <h5 className="font-medium text-sm mb-2">Coverage Details:</h5>
                        {coverageItem.class.map((classItem: any, index: number) => (
                          <div key={index} className="text-sm">
                            {classItem.type?.coding?.[0]?.display && (
                              <p><strong>{classItem.type.coding[0].display}:</strong> {classItem.value}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {coverageItem.costToBeneficiary && coverageItem.costToBeneficiary.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 rounded">
                        <h5 className="font-medium text-sm mb-2">Cost Information:</h5>
                        {coverageItem.costToBeneficiary.map((cost: any, index: number) => (
                          <div key={index} className="text-sm">
                            {cost.type?.coding?.[0]?.display && (
                              <p>
                                <strong>{cost.type.coding[0].display}:</strong> 
                                {cost.valueMoney ? formatCurrency(cost.valueMoney.value) : cost.valueQuantity?.value || 'N/A'}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
              
              {coverage?.length === 0 && (
                <Card>
                  <div className="text-center py-8 text-gray-500">
                    <p>No insurance coverage found for this patient.</p>
                    <p className="text-sm mt-2">Patient may be self-pay or coverage information may not be available.</p>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Patient Accounts & Billing Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black">Patient Accounts & Billing</h3>
            
            <div className="space-y-3">
              {accounts?.map((account: any) => (
                <Card key={account.id}>
                  <div className="text-black">
                    <h4 className="font-medium text-lg mb-2">
                      Account {account.id}
                    </h4>

                    {account.businessUnitName?.[0] && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Business Unit:</strong> {account.businessUnitName[0]}
                      </p>
                    )}

                    {account.outstandingBalance?.[0] && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Outstanding Balance:</strong> {formatCurrency(account.outstandingBalance[0].value)}
                      </p>
                    )}

                    {account.unusedFunds?.[0] && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Unused Funds:</strong> {formatCurrency(account.unusedFunds[0].value)}
                      </p>
                    )}

                    {account.owner?.display && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Account Owner:</strong> {account.owner.display}
                      </p>
                    )}

                    {account.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Description:</strong> {account.description}
                      </p>
                    )}

                    {account.guarantor && account.guarantor.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <h5 className="font-medium text-sm mb-2">Guarantor Information:</h5>
                        {account.guarantor.map((guarantor: any, index: number) => (
                          <div key={index} className="text-sm">
                            {guarantor.party?.display && (
                              <p><strong>Guarantor:</strong> {guarantor.party.display}</p>
                            )}
                            {guarantor.period && (
                              <p>
                                <strong>Period:</strong> 
                                {guarantor.period.start && ` ${formatDate(guarantor.period.start)}`}
                                {guarantor.period.end && ` - ${formatDate(guarantor.period.end)}`}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Associated coverage removed for simplicity */}
                    {false && account.coverage && account.coverage.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 rounded">
                        <h5 className="font-medium text-sm mb-2">Associated Coverage:</h5>
                        {account.coverage.map((cov: any, index: number) => (
                          <div key={index} className="text-sm">
                            <p><strong>Coverage:</strong> {cov.coverage?.display || cov.coverage?.reference}</p>
                            {cov.priority && <p><strong>Priority:</strong> {cov.priority}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
              
              {accounts?.length === 0 && (
                <Card>
                  <div className="text-center py-8 text-gray-500">
                    <p>No billing accounts found for this patient.</p>
                    <p className="text-sm mt-2">Account information may not be available or patient may not have active accounts.</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary Section */}
      {selectedPatientId && (coverage || accounts) && (
        <Card title="Billing Summary">
          <div className="text-black">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded">
                <h4 className="font-medium text-lg text-blue-800">Insurance Coverage</h4>
                <p className="text-2xl font-bold text-blue-900">{coverage?.length || 0}</p>
                <p className="text-sm text-blue-600">Active Policies</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded">
                <h4 className="font-medium text-lg text-green-800">Patient Accounts</h4>
                <p className="text-2xl font-bold text-green-900">{accounts?.length || 0}</p>
                <p className="text-sm text-green-600">Active Accounts</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded">
                <h4 className="font-medium text-lg text-purple-800">Eligibility Status</h4>
                <p className="text-lg font-bold text-purple-900">
                  {coverage?.some((c: any) => c.status === 'active') ? 'Verified' : 'Pending'}
                </p>
                <p className="text-sm text-purple-600">Coverage Verification</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

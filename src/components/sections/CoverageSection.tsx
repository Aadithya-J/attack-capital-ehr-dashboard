'use client';

import { useState } from 'react';
import { useCoverage, useCoverageItem } from '@/hooks/useCoverage';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function CoverageSection() {
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [searchForm, setSearchForm] = useState({
    patientId: ''
  });
  const [selectedCoverageId, setSelectedCoverageId] = useState<string>('');

  const { data: coverages, isLoading, error } = useCoverage(searchParams);
  const { data: selectedCoverage } = useCoverageItem(selectedCoverageId);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-50 px-2 py-1 rounded text-xs';
      case 'cancelled': return 'text-red-700 bg-red-50 px-2 py-1 rounded text-xs';
      case 'draft': return 'text-yellow-700 bg-yellow-50 px-2 py-1 rounded text-xs';
      default: return 'text-gray-700 bg-gray-100 px-2 py-1 rounded text-xs';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Coverage</h2>
      </div>

      <Card title="Search Coverage">
        <div className="grid grid-cols-1 gap-4 max-w-md">
          <Input
            label="Patient ID"
            value={searchForm.patientId}
            placeholder="Enter patient ID (e.g., 256587)"
            onChange={(value) => setSearchForm(prev => ({ ...prev, patientId: value }))}
          />
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={handleSearch}>
            Search Coverage
          </Button>
          <Button variant="secondary" onClick={handleClearSearch}>
            Clear Search
          </Button>
        </div>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error loading coverage: {error.message}</p>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <p>Loading coverage...</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Coverage List</h3>
          <div className="space-y-3">
            {coverages?.map((coverage) => (
              <Card key={coverage.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">
                        Coverage {coverage.id.slice(-8)}
                      </h4>
                      <span className={getStatusColor(coverage.status)}>
                        {coverage.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 mb-1">
                      <strong className="text-gray-900">Beneficiary:</strong> {coverage.beneficiary.display || coverage.beneficiary.reference}
                    </p>
                    {coverage.policyHolder?.display && (
                      <p className="text-sm text-gray-800 mb-1">
                        <strong className="text-gray-900">Policy Holder:</strong> {coverage.policyHolder.display}
                      </p>
                    )}
                    {coverage.relationship?.text && (
                      <p className="text-sm text-gray-800 mb-1">
                        <strong className="text-gray-900">Relationship:</strong> {coverage.relationship.text}
                      </p>
                    )}
                    {coverage.class?.[0] && (
                      <p className="text-sm text-gray-800">
                        <strong className="text-gray-900">Plan:</strong> {coverage.class[0].value}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      onClick={() => setSelectedCoverageId(coverage.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {coverages?.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No coverage found. Try adjusting your search criteria.
              </p>
            )}
          </div>
        </div>

        {selectedCoverage && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Coverage Details</h3>
            <Card>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Basic Information</h4>
                  <p className="text-gray-900"><strong>ID:</strong> {selectedCoverage.id}</p>
                  <p className="text-gray-900"><strong>Status:</strong>
                    <span className={`ml-2 ${getStatusColor(selectedCoverage.status)}`}>
                      {selectedCoverage.status}
                    </span>
                  </p>
                  <p className="text-gray-900"><strong>Beneficiary:</strong> {selectedCoverage.beneficiary.display || selectedCoverage.beneficiary.reference}</p>
                </div>

                {selectedCoverage.policyHolder && (
                  <div>
                    <h4 className="font-medium mb-2">Policy Holder</h4>
                    <p className="text-gray-900">{selectedCoverage.policyHolder.display}</p>
                  </div>
                )}

                {selectedCoverage.relationship && (
                  <div>
                    <h4 className="font-medium mb-2">Relationship</h4>
                    <p className="text-gray-900">{selectedCoverage.relationship.text}</p>
                    {selectedCoverage.relationship.coding && (
                      <div className="mt-2">
                        {selectedCoverage.relationship.coding.map((coding, index) => (
                          <div key={index} className="mb-1 p-2 bg-gray-50 rounded text-sm">
                            <p className="text-gray-900"><strong>Code:</strong> {coding.code}</p>
                            <p className="text-gray-900"><strong>Display:</strong> {coding.display}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {selectedCoverage.class && selectedCoverage.class.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Coverage Classes</h4>
                    {selectedCoverage.class.map((coverageClass, index) => (
                      <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                        <p className="text-gray-900"><strong>Type:</strong> {coverageClass.type.text}</p>
                        <p className="text-gray-900"><strong>Value:</strong> {coverageClass.value}</p>
                        {coverageClass.type.coding && (
                          <div className="mt-1">
                            {coverageClass.type.coding.map((coding, idx) => (
                              <div key={idx} className="text-sm">
                                <p className="text-gray-700"><strong>Code:</strong> {coding.code}</p>
                                <p className="text-gray-700"><strong>Display:</strong> {coding.display}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {selectedCoverage.order && (
                  <div>
                    <h4 className="font-medium mb-2">Order</h4>
                    <p className="text-gray-900">{selectedCoverage.order}</p>
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

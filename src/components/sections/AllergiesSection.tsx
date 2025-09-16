'use client';

import { useState } from 'react';
import { useAllergies, useAllergy, useCreateAllergy, useUpdateAllergy } from '@/hooks/useAllergies';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function AllergiesSection() {
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [searchForm, setSearchForm] = useState({
    patientId: ''
  });
  const [selectedAllergyId, setSelectedAllergyId] = useState<string>('');

  const { data: allergies, isLoading, error } = useAllergies(searchParams);
  const { data: selectedAllergy } = useAllergy(selectedAllergyId);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-700 bg-red-50 px-2 py-1 rounded text-xs';
      case 'inactive': return 'text-gray-700 bg-gray-100 px-2 py-1 rounded text-xs';
      case 'resolved': return 'text-green-700 bg-green-50 px-2 py-1 rounded text-xs';
      default: return 'text-gray-700 bg-gray-100 px-2 py-1 rounded text-xs';
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'high': return 'text-red-800 bg-red-100 px-2 py-1 rounded text-xs font-medium';
      case 'low': return 'text-yellow-800 bg-yellow-100 px-2 py-1 rounded text-xs font-medium';
      default: return 'text-gray-800 bg-gray-100 px-2 py-1 rounded text-xs font-medium';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Allergies</h2>
      </div>

      <Card title="Search Allergies">
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
            Search Allergies
          </Button>
          <Button variant="secondary" onClick={handleClearSearch}>
            Clear Search
          </Button>
        </div>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error loading allergies: {error.message}</p>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <p>Loading allergies...</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Allergies List</h3>
          <div className="space-y-3">
            {allergies?.map((allergy) => (
              <Card key={allergy.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">
                        {allergy.code?.text || allergy.code?.coding?.[0]?.display || 'Unknown Allergy'}
                      </h4>
                      {allergy.criticality && (
                        <span className={getCriticalityColor(allergy.criticality)}>
                          {allergy.criticality}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={getStatusColor(allergy.clinicalStatus?.coding?.[0]?.code || '')}>
                        {allergy.clinicalStatus?.coding?.[0]?.display || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                        {allergy.verificationStatus?.coding?.[0]?.display}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 mb-1">
                      <strong className="text-gray-900">Patient:</strong> {allergy.patient.display || allergy.patient.reference}
                    </p>
                    {allergy.code?.coding?.[0]?.code && (
                      <p className="text-sm text-gray-800 mb-1">
                        <strong className="text-gray-900">Code:</strong> {allergy.code.coding[0].code}
                      </p>
                    )}
                    {allergy.reaction?.[0]?.manifestation?.[0]?.text && (
                      <p className="text-sm text-gray-800 mb-1">
                        <strong className="text-gray-900">Reaction:</strong> {allergy.reaction[0].manifestation[0].text}
                      </p>
                    )}
                    {allergy.onsetDateTime && (
                      <p className="text-sm text-gray-800 mb-1">
                        <strong className="text-gray-900">Onset:</strong> {formatDate(allergy.onsetDateTime)}
                      </p>
                    )}
                    {allergy.recordedDate && (
                      <p className="text-sm text-gray-800">
                        <strong className="text-gray-900">Recorded:</strong> {formatDate(allergy.recordedDate)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      onClick={() => setSelectedAllergyId(allergy.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {allergies?.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No allergies found. Try adjusting your search criteria.
              </p>
            )}
          </div>
        </div>

        {selectedAllergy && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Allergy Details</h3>
            <Card>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Basic Information</h4>
                  <p className="text-gray-900"><strong>ID:</strong> {selectedAllergy.id}</p>
                  <p className="text-gray-900"><strong>Allergy:</strong> {selectedAllergy.code?.text || selectedAllergy.code?.coding?.[0]?.display}</p>
                  <p className="text-gray-900"><strong>Clinical Status:</strong>
                    <span className={`ml-2 ${getStatusColor(selectedAllergy.clinicalStatus?.coding?.[0]?.code || '')}`}>
                      {selectedAllergy.clinicalStatus?.coding?.[0]?.display}
                    </span>
                  </p>
                  <p className="text-gray-900"><strong>Verification Status:</strong> {selectedAllergy.verificationStatus?.coding?.[0]?.display}</p>
                  <p className="text-gray-900"><strong>Criticality:</strong> {selectedAllergy.criticality}</p>
                  <p className="text-gray-900"><strong>Patient:</strong> {selectedAllergy.patient.display || selectedAllergy.patient.reference}</p>
                </div>

                {selectedAllergy.code?.coding && (
                  <div>
                    <h4 className="font-medium mb-2">Coding Information</h4>
                    {selectedAllergy.code.coding.map((coding, index) => (
                      <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                        <p className="text-gray-900"><strong>Code:</strong> {coding.code}</p>
                        <p className="text-gray-900"><strong>Display:</strong> {coding.display}</p>
                        {coding.system && <p className="text-gray-900"><strong>System:</strong> {coding.system}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {selectedAllergy.reaction && selectedAllergy.reaction.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Reactions</h4>
                    {selectedAllergy.reaction.map((reaction, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded mb-2">
                        {reaction.manifestation?.map((manifestation, idx) => (
                          <p key={idx} className="text-gray-900">{manifestation.text}</p>
                        ))}
                        {reaction.severity && (
                          <p className="text-gray-900"><strong>Severity:</strong> {reaction.severity}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Timeline</h4>
                  {selectedAllergy.onsetDateTime && (
                    <p className="text-gray-900"><strong>Onset Date:</strong> {formatDate(selectedAllergy.onsetDateTime)}</p>
                  )}
                  {selectedAllergy.recordedDate && (
                    <p className="text-gray-900"><strong>Recorded Date:</strong> {formatDate(selectedAllergy.recordedDate)}</p>
                  )}
                </div>

                {selectedAllergy.note && selectedAllergy.note.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Notes</h4>
                    {selectedAllergy.note.map((note, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded mb-2">
                        <p className="text-gray-900">{note.text}</p>
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

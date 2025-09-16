'use client';

import { useState } from 'react';
import { useEncounters, useEncounter } from '@/hooks/useEncounters';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function EncountersSection() {
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [searchForm, setSearchForm] = useState({
    patientId: ''
  });
  const [selectedEncounterId, setSelectedEncounterId] = useState<string>('');

  const { data: encounters, isLoading, error } = useEncounters(searchParams);
  const { data: selectedEncounter } = useEncounter(selectedEncounterId);

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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress': return 'text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs';
      case 'finished': return 'text-green-700 bg-green-50 px-2 py-1 rounded text-xs';
      case 'cancelled': return 'text-red-700 bg-red-50 px-2 py-1 rounded text-xs';
      case 'planned': return 'text-yellow-700 bg-yellow-50 px-2 py-1 rounded text-xs';
      default: return 'text-gray-700 bg-gray-100 px-2 py-1 rounded text-xs';
    }
  };

  const getClassColor = (classCode: string) => {
    switch (classCode) {
      case 'AMB': return 'text-blue-800 bg-blue-100 px-2 py-1 rounded text-xs font-medium';
      case 'IMP': return 'text-red-800 bg-red-100 px-2 py-1 rounded text-xs font-medium';
      case 'EMER': return 'text-orange-800 bg-orange-100 px-2 py-1 rounded text-xs font-medium';
      default: return 'text-gray-800 bg-gray-100 px-2 py-1 rounded text-xs font-medium';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Encounters</h2>
      </div>

      <Card title="Search Encounters">
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
            Search Encounters
          </Button>
          <Button variant="secondary" onClick={handleClearSearch}>
            Clear Search
          </Button>
        </div>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error loading encounters: {error.message}</p>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <p>Loading encounters...</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Encounters List</h3>
          <div className="space-y-3">
            {encounters?.map((encounter) => (
              <Card key={encounter.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">
                        {encounter.type?.[0]?.coding?.[0]?.display || 'Encounter'}
                      </h4>
                      <span className={getStatusColor(encounter.status)}>
                        {encounter.status}
                      </span>
                      <span className={getClassColor(encounter.class.code)}>
                        {encounter.class.display}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 mb-1">
                      <strong className="text-gray-900">Patient:</strong> {encounter.subject.display || encounter.subject.reference}
                    </p>
                    {encounter.participant?.[0]?.individual?.display && (
                      <p className="text-sm text-gray-800 mb-1">
                        <strong className="text-gray-900">Practitioner:</strong> {encounter.participant[0].individual.display}
                      </p>
                    )}
                    {encounter.location?.[0]?.location?.display && (
                      <p className="text-sm text-gray-800 mb-1">
                        <strong className="text-gray-900">Location:</strong> {encounter.location[0].location.display}
                      </p>
                    )}
                    {encounter.period?.start && (
                      <p className="text-sm text-gray-800 mb-1">
                        <strong className="text-gray-900">Started:</strong> {formatDateTime(encounter.period.start)}
                      </p>
                    )}
                    {encounter.period?.end && (
                      <p className="text-sm text-gray-800 mb-1">
                        <strong className="text-gray-900">Ended:</strong> {formatDateTime(encounter.period.end)}
                      </p>
                    )}
                    {encounter.reasonCode?.[0]?.text && (
                      <p className="text-sm text-gray-800">
                        <strong className="text-gray-900">Reason:</strong> {encounter.reasonCode[0].text}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      onClick={() => setSelectedEncounterId(encounter.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {encounters?.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No encounters found. Try adjusting your search criteria.
              </p>
            )}
          </div>
        </div>

        {selectedEncounter && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Encounter Details</h3>
            <Card>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Basic Information</h4>
                  <p className="text-gray-900"><strong>ID:</strong> {selectedEncounter.id}</p>
                  <p className="text-gray-900"><strong>Status:</strong>
                    <span className={`ml-2 ${getStatusColor(selectedEncounter.status)}`}>
                      {selectedEncounter.status}
                    </span>
                  </p>
                  <p className="text-gray-900"><strong>Class:</strong>
                    <span className={`ml-2 ${getClassColor(selectedEncounter.class.code)}`}>
                      {selectedEncounter.class.display}
                    </span>
                  </p>
                  <p className="text-gray-900"><strong>Patient:</strong> {selectedEncounter.subject.display || selectedEncounter.subject.reference}</p>
                </div>

                {selectedEncounter.type && (
                  <div>
                    <h4 className="font-medium mb-2">Encounter Type</h4>
                    {selectedEncounter.type.map((type, index) => (
                      <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                        {type.coding?.map((coding, idx) => (
                          <div key={idx}>
                            <p className="text-gray-900"><strong>Code:</strong> {coding.code}</p>
                            <p className="text-gray-900"><strong>Display:</strong> {coding.display}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {selectedEncounter.participant && (
                  <div>
                    <h4 className="font-medium mb-2">Participants</h4>
                    {selectedEncounter.participant.map((participant, index) => (
                      <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                        <p className="text-gray-900"><strong>Role:</strong> {participant.type?.[0]?.text}</p>
                        <p className="text-gray-900"><strong>Individual:</strong> {participant.individual?.display}</p>
                      </div>
                    ))}
                  </div>
                )}

                {selectedEncounter.location && (
                  <div>
                    <h4 className="font-medium mb-2">Locations</h4>
                    {selectedEncounter.location.map((loc, index) => (
                      <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                        <p className="text-gray-900">{loc.location.display}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Timeline</h4>
                  {selectedEncounter.period?.start && (
                    <p className="text-gray-900"><strong>Start:</strong> {formatDateTime(selectedEncounter.period.start)}</p>
                  )}
                  {selectedEncounter.period?.end && (
                    <p className="text-gray-900"><strong>End:</strong> {formatDateTime(selectedEncounter.period.end)}</p>
                  )}
                </div>

                {selectedEncounter.reasonCode && (
                  <div>
                    <h4 className="font-medium mb-2">Reason</h4>
                    {selectedEncounter.reasonCode.map((reason, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded">
                        <p className="text-gray-900">{reason.text}</p>
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

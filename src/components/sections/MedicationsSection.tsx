'use client';

import { useState } from 'react';
import { useMedications, useMedication, useCreateMedication, useUpdateMedication } from '@/hooks/useMedications';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function MedicationsSection() {
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [searchForm, setSearchForm] = useState({
    patientId: ''
  });
  const [selectedMedicationId, setSelectedMedicationId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  const [newMedication, setNewMedication] = useState({
    patientId: '',
    medicationCode: '',
    medicationDisplay: '',
    dosageText: '',
    startDate: '',
    status: 'active'
  });

  const { data: medications, isLoading, error } = useMedications(searchParams);
  const { data: selectedMedication } = useMedication(selectedMedicationId);
  const createMedication = useCreateMedication();
  const updateMedication = useUpdateMedication();

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

  const handleCreateMedication = async () => {
    if (!newMedication.patientId || !newMedication.medicationCode) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const medicationData = {
        resourceType: "MedicationStatement",
        status: newMedication.status,
        medicationCodeableConcept: {
          coding: [{
            system: "RxNorm",
            code: newMedication.medicationCode,
            display: newMedication.medicationDisplay || newMedication.medicationCode
          }],
          text: newMedication.medicationDisplay || newMedication.medicationCode
        },
        subject: {
          reference: `Patient/${newMedication.patientId}`
        },
        ...(newMedication.startDate && {
          effectivePeriod: {
            start: newMedication.startDate
          }
        }),
        ...(newMedication.dosageText && {
          dosage: [{
            text: newMedication.dosageText
          }]
        })
      };

      await createMedication.mutateAsync(medicationData);

      alert('✅ Medication created successfully!');
      setIsCreating(false);
      setNewMedication({
        patientId: '',
        medicationCode: '',
        medicationDisplay: '',
        dosageText: '',
        startDate: '',
        status: 'active'
      });
    } catch (error) {
      console.error('Failed to create medication:', error);
      alert('Failed to create medication');
    }
  };

  const handleUpdateStatus = async (medicationId: string, newStatus: string) => {
    try {
      await updateMedication.mutateAsync({
        medicationId,
        data: { status: newStatus }
      });
    } catch (error) {
      console.error('Failed to update medication:', error);
      alert('Failed to update medication');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-50 px-2 py-1 rounded text-xs';
      case 'stopped': return 'text-red-700 bg-red-50 px-2 py-1 rounded text-xs';
      case 'completed': return 'text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs';
      default: return 'text-gray-700 bg-gray-100 px-2 py-1 rounded text-xs';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Medications</h2>
        <Button onClick={() => setIsCreating(true)}>
          Add Medication
        </Button>
      </div>

      {isCreating && (
        <Card title="Add New Medication">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Patient ID"
              value={newMedication.patientId}
              onChange={(value) => setNewMedication(prev => ({ ...prev, patientId: value }))}
              required
            />
            <Input
              label="Medication Code (RxNorm)"
              value={newMedication.medicationCode}
              onChange={(value) => setNewMedication(prev => ({ ...prev, medicationCode: value }))}
              placeholder="e.g., 314076"
              required
            />
            <Input
              label="Medication Name"
              value={newMedication.medicationDisplay}
              onChange={(value) => setNewMedication(prev => ({ ...prev, medicationDisplay: value }))}
              placeholder="e.g., Lisinopril 10 MG Oral Tablet"
            />
            <Input
              label="Start Date"
              type="date"
              value={newMedication.startDate}
              onChange={(value) => setNewMedication(prev => ({ ...prev, startDate: value }))}
            />
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={newMedication.status}
                onChange={(e) => setNewMedication(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="active">Active</option>
                <option value="stopped">Stopped</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="col-span-2">
              <Input
                label="Dosage Instructions"
                value={newMedication.dosageText}
                onChange={(value) => setNewMedication(prev => ({ ...prev, dosageText: value }))}
                placeholder="e.g., Take one tablet by mouth once daily."
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleCreateMedication}
              disabled={createMedication.isPending}
            >
              {createMedication.isPending ? 'Creating...' : 'Create Medication'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsCreating(false)}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <Card title="Search Medications">
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
            Search Medications
          </Button>
          <Button variant="secondary" onClick={handleClearSearch}>
            Clear Search
          </Button>
        </div>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error loading medications: {error.message}</p>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <p>Loading medications...</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Medications List</h3>
          <div className="space-y-3">
            {medications?.map((medication) => (
              <Card key={medication.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">
                        {medication.medicationCodeableConcept?.text || medication.medicationCodeableConcept?.coding?.[0]?.display || 'Unknown Medication'}
                      </h4>
                      <span className={getStatusColor(medication.status)}>
                        {medication.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 mb-1">
                      <strong className="text-gray-900">Patient:</strong> {medication.subject.display || medication.subject.reference}
                    </p>
                    {medication.medicationCodeableConcept?.coding?.[0]?.code && (
                      <p className="text-sm text-gray-800 mb-1">
                        <strong className="text-gray-900">Code:</strong> {medication.medicationCodeableConcept.coding[0].code}
                      </p>
                    )}
                    {medication.dosage?.[0]?.text && (
                      <p className="text-sm text-gray-800 mb-1">
                        <strong className="text-gray-900">Dosage:</strong> {medication.dosage[0].text}
                      </p>
                    )}
                    {medication.effectivePeriod?.start && (
                      <p className="text-sm text-gray-800 mb-1">
                        <strong className="text-gray-900">Started:</strong> {formatDate(medication.effectivePeriod.start)}
                      </p>
                    )}
                    {medication.dateAsserted && (
                      <p className="text-sm text-gray-800">
                        <strong className="text-gray-900">Recorded:</strong> {formatDate(medication.dateAsserted)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    {medication.status === 'active' && (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => handleUpdateStatus(medication.id, 'stopped')}
                        >
                          Mark Stopped
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleUpdateStatus(medication.id, 'completed')}
                        >
                          Mark Completed
                        </Button>
                      </>
                    )}
                    {medication.status === 'stopped' && (
                      <Button
                        onClick={() => handleUpdateStatus(medication.id, 'active')}
                      >
                        Reactivate
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            {medications?.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No medications found. Try adjusting your search criteria.
              </p>
            )}
          </div>
        </div>

        {selectedMedication && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Medication Details</h3>
            <Card>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Basic Information</h4>
                  <p className="text-gray-900"><strong>ID:</strong> {selectedMedication.id}</p>
                  <p className="text-gray-900"><strong>Medication:</strong> {selectedMedication.medicationCodeableConcept?.text || selectedMedication.medicationCodeableConcept?.coding?.[0]?.display}</p>
                  <p className="text-gray-900"><strong>Status:</strong>
                    <span className={`ml-2 ${getStatusColor(selectedMedication.status)}`}>
                      {selectedMedication.status}
                    </span>
                  </p>
                  <p className="text-gray-900"><strong>Patient:</strong> {selectedMedication.subject.display || selectedMedication.subject.reference}</p>
                </div>

                {selectedMedication.medicationCodeableConcept?.coding && (
                  <div>
                    <h4 className="font-medium mb-2">Coding Information</h4>
                    {selectedMedication.medicationCodeableConcept.coding.map((coding, index) => (
                      <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                        <p className="text-gray-900"><strong>Code:</strong> {coding.code}</p>
                        <p className="text-gray-900"><strong>Display:</strong> {coding.display}</p>
                        {coding.system && <p className="text-gray-900"><strong>System:</strong> {coding.system}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {selectedMedication.dosage && selectedMedication.dosage.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Dosage</h4>
                    {selectedMedication.dosage.map((dosage, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded mb-2">
                        <p className="text-gray-900">{dosage.text}</p>
                        {dosage.doseAndRate?.doseQuantity && (
                          <p className="text-gray-900">
                            <strong>Dose:</strong> {dosage.doseAndRate.doseQuantity.value} {dosage.doseAndRate.doseQuantity.unit}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Timeline</h4>
                  {selectedMedication.effectivePeriod?.start && (
                    <p className="text-gray-900"><strong>Start Date:</strong> {formatDate(selectedMedication.effectivePeriod.start)}</p>
                  )}
                  {selectedMedication.effectivePeriod?.end && (
                    <p className="text-gray-900"><strong>End Date:</strong> {formatDate(selectedMedication.effectivePeriod.end)}</p>
                  )}
                  {selectedMedication.dateAsserted && (
                    <p className="text-gray-900"><strong>Recorded Date:</strong> {formatDate(selectedMedication.dateAsserted)}</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

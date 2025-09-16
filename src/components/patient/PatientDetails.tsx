'use client';

import { useState } from 'react';
import { usePatient, useUpdatePatient } from '@/hooks/usePatients';
import { useMedications } from '@/hooks/useMedications';
import AllergyManagement from './AllergyManagement';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

interface PatientDetailsProps {
  patientId: string;
  onBack: () => void;
}

export default function PatientDetails({ patientId, onBack }: PatientDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPatient, setEditedPatient] = useState<any>({});

  // Fetch patient data
  const { data: patient, isLoading: patientLoading, error: patientError } = usePatient(patientId);
  const { data: medications, isLoading: medicationsLoading, error: medicationsError } = useMedications({ patient: patientId });
  
  const updatePatientMutation = useUpdatePatient();

  const formatPatientName = (patient: any) => {
    const name = patient?.name?.[0];
    if (!name) return 'Unknown Patient';
    const given = name.given?.join(' ') || '';
    const family = name.family || '';
    return `${given} ${family}`.trim();
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedPatient({});
    } else {
      setEditedPatient({
        name: patient?.name?.[0] || {},
        telecom: patient?.telecom || [],
        address: patient?.address?.[0] || {}
      });
    }
    setIsEditing(!isEditing);
  };

  const handleUpdatePatient = async () => {
    if (!editedPatient || !patient) return;

    try {
      // Format patient data according to FHIR specification
      const patientUpdate: any = {
        resourceType: "Patient",
        id: patientId,
      };

      // Include name if it was edited
      if (editedPatient.name && (editedPatient.name.given || editedPatient.name.family)) {
        patientUpdate.name = [{
          given: editedPatient.name.given || patient.name?.[0]?.given || [],
          family: editedPatient.name.family || patient.name?.[0]?.family || ''
        }];
      }

      // Include telecom if it was edited
      if (editedPatient.telecom) {
        patientUpdate.telecom = editedPatient.telecom;
      }

      // Include address if it was edited
      if (editedPatient.address && (editedPatient.address.line || editedPatient.address.city || editedPatient.address.state || editedPatient.address.postalCode)) {
        patientUpdate.address = [{
          line: editedPatient.address.line ? [editedPatient.address.line] : patient.address?.[0]?.line || [],
          city: editedPatient.address.city || patient.address?.[0]?.city || '',
          state: editedPatient.address.state || patient.address?.[0]?.state || '',
          postalCode: editedPatient.address.postalCode || patient.address?.[0]?.postalCode || ''
        }];
      }

      console.log('Sending patient update:', JSON.stringify(patientUpdate, null, 2));

      await updatePatientMutation.mutateAsync({
        patientId: patientId,
        data: patientUpdate
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update patient:', error);
    }
  };


  if (patientLoading) {
    return (
      <div className="p-6">
        <Card title="Loading Patient Details...">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (patientError || !patient) {
    return (
      <div className="p-6">
        <Card title="Error Loading Patient">
          <p className="text-red-600">Failed to load patient details</p>
          <Button onClick={onBack} variant="secondary" className="mt-4">
            ← Back to Search
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="secondary">
          ← Back to Search
        </Button>
        <Button 
          onClick={handleEditToggle} 
          variant={isEditing ? "danger" : "primary"}
        >
          {isEditing ? '❌ Cancel' : '✏️ Edit Patient'}
        </Button>
      </div>

      {/* Patient Demographics */}
      <Card title="👤 Patient Demographics">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
          <div>
            <h3 className="font-semibold text-lg mb-4">{formatPatientName(patient)}</h3>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <Input
                    value={editedPatient.name?.given?.[0] || patient.name?.[0]?.given?.[0] || ''}
                    onChange={(value: string) => setEditedPatient({
                      ...editedPatient,
                      name: { ...editedPatient.name, given: [value] }
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <Input
                    value={editedPatient.name?.family || patient.name?.[0]?.family || ''}
                    onChange={(value: string) => setEditedPatient({
                      ...editedPatient,
                      name: { ...editedPatient.name, family: value }
                    })}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p><strong>Gender:</strong> {patient.gender || 'Not specified'}</p>
                <p><strong>Date of Birth:</strong> {patient.birthDate || 'Not specified'}</p>
                <p><strong>Age:</strong> {patient.birthDate ? calculateAge(patient.birthDate) : 'Unknown'}</p>
                <p><strong>Patient ID:</strong> {patient.id}</p>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-medium mb-3">Contact Information</h4>
            {isEditing ? (
              <div className="space-y-3">
                {patient.telecom?.map((contact: any, index: number) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {contact.system === 'phone' ? 'Phone' : 'Email'}
                    </label>
                    <Input
                      value={editedPatient.telecom?.[index]?.value || contact.value}
                      onChange={(value: string) => {
                        const updatedTelecom = [...(editedPatient.telecom || patient.telecom)];
                        updatedTelecom[index] = { ...updatedTelecom[index], value: value };
                        setEditedPatient({ ...editedPatient, telecom: updatedTelecom });
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {patient.telecom?.map((contact: any, index: number) => (
                  <p key={index}>
                    <strong>{contact.system === 'phone' ? '📞' : '📧'}:</strong> {contact.value}
                  </p>
                ))}
                {patient.address?.[0] && (
                  <div className="mt-3">
                    <p><strong>🏠 Address:</strong></p>
                    <p className="text-sm text-gray-600">
                      {patient.address[0].line?.join(', ')}<br/>
                      {patient.address[0].city}, {patient.address[0].state} {patient.address[0].postalCode}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 flex gap-2">
            <Button variant="primary" onClick={handleUpdatePatient} disabled={updatePatientMutation.isPending}>
              {updatePatientMutation.isPending ? '💾 Saving...' : '💾 Save Changes'}
            </Button>
          </div>
        )}
      </Card>

      {/* Allergies Management */}
      <AllergyManagement patientId={patientId} />

      {/* Medications */}
      <Card title="💊 Current Medications">
        {medicationsLoading ? (
          <p>Loading medications...</p>
        ) : (medications as any)?.entry?.length > 0 ? (
          <div className="space-y-3">
            {(medications as any).entry.map((entry: any) => {
              const medication = entry.resource;
              return (
                <div key={medication.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-blue-800">
                        {medication.medicationCodeableConcept?.text || 
                         medication.medicationCodeableConcept?.coding?.[0]?.display || 
                         'Unknown Medication'}
                      </h4>
                      {medication.dosage?.[0] && (
                        <p className="text-sm text-blue-600">
                          <strong>Dosage:</strong> {medication.dosage[0].text}
                        </p>
                      )}
                      {medication.effectivePeriod?.start && (
                        <p className="text-xs text-blue-500">
                          Started: {new Date(medication.effectivePeriod.start).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {medication.status || 'Active'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">No current medications recorded.</p>
        )}
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { usePatients, usePatient, useUpdatePatient } from '@/hooks/usePatients';

interface Patient {
  id: string;
  name: Array<{
    given: string[];
    family: string;
  }>;
  gender: string;
  birthDate: string;
  telecom?: Array<{
    system: string;
    value: string;
  }>;
  address?: Array<{
    line: string[];
    city: string;
    state: string;
    postalCode: string;
  }>;
}

export default function PatientsSection() {
  const [searchParams, setSearchParams] = useState<Record<string, string> | undefined>();
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [givenName, setGivenName] = useState('');
  const [patientId, setPatientId] = useState('');

  const { data: patients = [], isLoading, error } = usePatients(searchParams);
  const { data: selectedPatient } = usePatient(selectedPatientId);
  const updatePatientMutation = useUpdatePatient();

  const handleSearch = () => {
    const params: Record<string, string> = {};
    if (familyName.trim()) params.family = familyName.trim();
    if (givenName.trim()) params.given = givenName.trim();
    if (patientId.trim()) params._id = patientId.trim();
    
    if (Object.keys(params).length > 0) {
      setSearchParams(params);
    } else {
      setSearchParams({});
    }
  };

  const getPatientName = (patient: Patient) => {
    if (patient.name && patient.name[0]) {
      const name = patient.name[0];
      return `${name.given?.join(' ') || ''} ${name.family || ''}`.trim();
    }
    return 'Unknown';
  };

  const getPatientPhone = (patient: Patient) => {
    const phone = patient.telecom?.find(t => t.system === 'phone');
    return phone?.value || 'N/A';
  };

  const getPatientAddress = (patient: Patient) => {
    if (patient.address && patient.address[0]) {
      const addr = patient.address[0];
      return `${addr.line?.join(', ') || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.postalCode || ''}`.trim();
    }
    return 'N/A';
  };

  return (
    <div className="space-y-6">
      <Card title="Patient Management">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 mb-4 text-black">
            <Input
              label="Search by Family Name"
              placeholder="Enter family name"
              value={familyName}
              onChange={setFamilyName}
            />
            <Input
              label="Search by Given Name"
              placeholder="Enter given name"
              value={givenName}
              onChange={setGivenName}
            />
            <Input
              label="Search by ID"
              placeholder="Enter patient ID"
              value={patientId}
              onChange={setPatientId}
            />
          </div>
          <div className="flex justify-between items-center mb-6">
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search Patients'}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setShowCreateForm(true)}
            >
              Add Patient
            </Button>
          </div>
          {error && (
            <div className="text-red-600 text-sm">
              Error: {error.message}
            </div>
          )}
        </div>
      </Card>

      {patients.length > 0 && (
        <Card title={`Patients (${patients.length})`}>
          <div className="space-y-4">
            {patients.map((patient) => (
              <div 
                key={patient.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedPatientId(patient.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{getPatientName(patient)}</h3>
                    <p className="text-sm text-gray-800 mb-1">
                      <strong className="text-gray-900">ID:</strong> {patient.id}
                    </p>
                    <p className="text-sm text-gray-800 mb-1">
                      <strong className="text-gray-900">Gender:</strong> {patient.gender}
                    </p>
                    <p className="text-sm text-gray-800 mb-1">
                      <strong className="text-gray-900">Birth Date:</strong> {patient.birthDate}
                    </p>
                    {patient.telecom && (
                      <p className="text-sm text-gray-800">
                        <strong className="text-gray-900">Contact:</strong> {patient.telecom[0]?.value}
                      </p>
                    )}
                    <p className="text-sm text-gray-800">
                      <strong className="text-gray-900">Address:</strong> {getPatientAddress(patient)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {selectedPatient && (
        <Card title="Patient Details">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{getPatientName(selectedPatient)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPatient.gender}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Birth Date</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPatient.birthDate}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{getPatientPhone(selectedPatient)}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <p className="mt-1 text-sm text-gray-900">{getPatientAddress(selectedPatient)}</p>
            </div>
            <div className="flex space-x-4">
              <Button variant="secondary" onClick={() => setSelectedPatientId('')}>
                Close
              </Button>
              <Button>
                Edit Patient
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

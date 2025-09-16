'use client';

import { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';

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
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const searchPatients = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) {
        params.append('name', searchTerm);
      }
      
      const response = await fetch(`/api/patients?${params}`);
      const data = await response.json();
      
      if (data.entry) {
        setPatients(data.entry.map((entry: any) => entry.resource));
      }
    } catch (error) {
      console.error('Error searching patients:', error);
    } finally {
      setLoading(false);
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

  useEffect(() => {
    searchPatients();
  }, []);

  return (
    <div className="space-y-6">
      <Card title="Patient Management">
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Input
              placeholder="Search by name..."
              value={searchTerm}
              onChange={setSearchTerm}
              className="flex-1"
            />
            <Button onClick={searchPatients} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setShowCreateForm(true)}
            >
              Add Patient
            </Button>
          </div>
        </div>
      </Card>

      {patients.length > 0 && (
        <Card title={`Patients (${patients.length})`}>
          <div className="space-y-4">
            {patients.map((patient) => (
              <div 
                key={patient.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedPatient(patient)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{getPatientName(patient)}</h3>
                    <p className="text-gray-600">ID: {patient.id}</p>
                    <p className="text-gray-600">Gender: {patient.gender}</p>
                    <p className="text-gray-600">DOB: {patient.birthDate}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>Phone: {getPatientPhone(patient)}</p>
                    <p>Address: {getPatientAddress(patient)}</p>
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
              <Button variant="secondary" onClick={() => setSelectedPatient(null)}>
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

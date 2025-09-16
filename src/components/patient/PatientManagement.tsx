'use client';

import { useState } from 'react';
import PatientSearch from './PatientSearch';
import PatientDetails from './PatientDetails';

export default function PatientManagement() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
  };

  const handleBackToSearch = () => {
    setSelectedPatientId(null);
  };

  return (
    <div className="p-6">
      {selectedPatientId ? (
        <PatientDetails 
          patientId={selectedPatientId} 
          onBack={handleBackToSearch}
        />
      ) : (
        <PatientSearch onPatientSelect={handlePatientSelect} />
      )}
    </div>
  );
}

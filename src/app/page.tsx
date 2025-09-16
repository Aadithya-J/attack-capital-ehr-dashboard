'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import CredentialsSection from '@/components/sections/CredentialsSection';
import PatientsSection from '@/components/sections/PatientsSection';
import AppointmentsSection from '@/components/sections/AppointmentsSection';
import ConditionsSection from '@/components/sections/ConditionsSection';
import MedicationsSection from '@/components/sections/MedicationsSection';
import AllergiesSection from '@/components/sections/AllergiesSection';
import EncountersSection from '@/components/sections/EncountersSection';
import AccountsSection from '@/components/sections/AccountsSection';
import CoverageSection from '@/components/sections/CoverageSection';
import ClinicalNotesSection from '@/components/sections/ClinicalNotesSection';

interface Credentials {
  baseUrl: string;
  firmUrlPrefix: string;
  apiKey: string;
  username: string;
  password: string;
}

export default function Home() {
  const [activeSection, setActiveSection] = useState('credentials');
  const [credentials, setCredentials] = useState<Credentials>({
    baseUrl: '',
    firmUrlPrefix: '',
    apiKey: '',
    username: '',
    password: ''
  });

  const renderSection = () => {
    switch (activeSection) {
      case 'credentials':
        return <CredentialsSection onCredentialsChange={setCredentials} />;
      case 'patients':
        return <PatientsSection />;
      case 'appointments':
        return <AppointmentsSection />;
      case 'conditions':
        return <ConditionsSection />;
      case 'medications':
        return <MedicationsSection />;
      case 'allergies':
        return <AllergiesSection />;
      case 'encounters':
        return <EncountersSection />;
      case 'accounts':
        return <AccountsSection />;
      case 'coverage':
        return <CoverageSection />;
      case 'clinical-notes':
        return <ClinicalNotesSection />;
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h2>
            <p className="text-gray-600">Coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}

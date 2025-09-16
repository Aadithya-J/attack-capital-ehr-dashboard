'use client';

import Sidebar from '@/components/layout/Sidebar';
import PatientManagement from '@/components/patient/PatientManagement';

export default function PatientsPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <PatientManagement />
        </div>
      </main>
    </div>
  );
}

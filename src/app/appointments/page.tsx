'use client';

import Sidebar from '@/components/layout/Sidebar';
import AppointmentsSection from '@/components/sections/AppointmentsSection';

export default function AppointmentsPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <AppointmentsSection />
        </div>
      </main>
    </div>
  );
}

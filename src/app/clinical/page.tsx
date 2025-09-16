'use client';

import Sidebar from '@/components/layout/Sidebar';
import ClinicalSection from '@/components/sections/ClinicalSection';

export default function ClinicalPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <ClinicalSection />
        </div>
      </main>
    </div>
  );
}

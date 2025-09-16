'use client';

import Sidebar from '@/components/layout/Sidebar';
import BillingSection from '@/components/sections/BillingSection';

export default function BillingPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeSection="billing" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <BillingSection />
        </div>
      </main>
    </div>
  );
}

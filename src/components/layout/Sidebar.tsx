'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const sections = [
  { id: 'dashboard', name: 'Dashboard', icon: '📊', href: '/' },
  { id: 'patient-management', name: 'Patient Management', icon: '👥', href: '/patients' },
  { id: 'appointments', name: 'Appointment Scheduling', icon: '📅', href: '/appointments' },
  { id: 'clinical-operations', name: 'Clinical Operations', icon: '🏥', href: '/clinical' },
  { id: 'billing', name: 'Billing & Administrative', icon: '💰', href: '/billing' },
  { id: 'credentials', name: 'Credentials', icon: '🔑', href: '/credentials' },
];

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const pathname = usePathname();
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-8">EHR Dashboard</h1>
        
        <nav className="space-y-1">
          {sections.map((section) => {
            const isActive = onSectionChange
              ? activeSection === section.id
              : pathname === section.href;

            const className = `w-full text-left px-3 py-2 rounded-md transition-colors text-sm ${
              isActive
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`;

            if (onSectionChange) {
              return (
                <button
                  key={section.id}
                  onClick={() => onSectionChange(section.id)}
                  className={className}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-500">{section.icon}</span>
                    <span>{section.name}</span>
                  </div>
                </button>
              );
            }

            return (
              <Link key={section.id} href={section.href} className={className}>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-500">{section.icon}</span>
                  <span>{section.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

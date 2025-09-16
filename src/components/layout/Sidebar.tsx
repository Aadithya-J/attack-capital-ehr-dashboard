'use client';

import { useState } from 'react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sections = [
  { id: 'credentials', name: 'Credentials', icon: '•' },
  { id: 'patients', name: 'Patients', icon: '•' },
  { id: 'appointments', name: 'Appointments', icon: '•' },
  { id: 'conditions', name: 'Conditions', icon: '•' },
  { id: 'medications', name: 'Medications', icon: '•' },
  { id: 'allergies', name: 'Allergies', icon: '•' },
  { id: 'encounters', name: 'Encounters', icon: '•' },
  { id: 'accounts', name: 'Accounts', icon: '•' },
  { id: 'coverage', name: 'Coverage', icon: '•' },
  { id: 'clinical-notes', name: 'Clinical Notes', icon: '•' },
];

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-8">EHR Dashboard</h1>
        
        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm ${
                activeSection === section.id
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-gray-500">{section.icon}</span>
                <span>{section.name}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

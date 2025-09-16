'use client';

import { useState } from 'react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sections = [
  { id: 'credentials', name: 'API Credentials', icon: '🔑' },
  { id: 'patients', name: 'Patients', icon: '👤' },
  { id: 'appointments', name: 'Appointments', icon: '📅' },
  { id: 'conditions', name: 'Conditions', icon: '🏥' },
  { id: 'medications', name: 'Medications', icon: '💊' },
  { id: 'allergies', name: 'Allergies', icon: '⚠️' },
  { id: 'encounters', name: 'Encounters', icon: '🩺' },
  { id: 'coverage', name: 'Coverage', icon: '🛡️' },
  { id: 'accounts', name: 'Accounts', icon: '💰' },
  { id: 'practitioners', name: 'Practitioners', icon: '👨‍⚕️' },
  { id: 'locations', name: 'Locations', icon: '📍' },
];

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <div className="w-64 bg-gray-900 text-white h-screen overflow-y-auto">
      <div className="p-6">
        <h1 className="text-xl font-bold">EHR Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">ModMed Integration</p>
      </div>
      
      <nav className="mt-6">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`w-full text-left px-6 py-3 flex items-center space-x-3 hover:bg-gray-800 transition-colors ${
              activeSection === section.id ? 'bg-blue-600 border-r-4 border-blue-400' : ''
            }`}
          >
            <span className="text-lg">{section.icon}</span>
            <span>{section.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface PatientSearchProps {
  onPatientSelect: (patientId: string) => void;
}

export default function PatientSearch({ onPatientSelect }: PatientSearchProps) {
  const [searchParams, setSearchParams] = useState({
    family: '',
    given: '',
    id: ''
  });
  const [searchType, setSearchType] = useState<'name' | 'id'>('name');
  const [hasSearched, setHasSearched] = useState(false);

  // Build search query based on type and params
  const buildSearchQuery = () => {
    if (!hasSearched) return null;
    
    if (searchType === 'id' && searchParams.id.trim()) {
      return `/api/patients/${searchParams.id.trim()}`;
    }
    
    if (searchType === 'name') {
      const params = new URLSearchParams();
      if (searchParams.family.trim()) params.append('family', searchParams.family.trim());
      if (searchParams.given.trim()) params.append('given', searchParams.given.trim());
      
      if (params.toString()) {
        return `/api/patients?${params.toString()}`;
      }
    }
    
    return null;
  };

  const searchQuery = buildSearchQuery();

  const { data: searchResult, isLoading, error, refetch } = useQuery({
    queryKey: ['patient-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return null;
      
      const response = await fetch(searchQuery);
      if (!response.ok) {
        throw new Error('Failed to search patients');
      }
      const data = await response.json();
      
      // Handle single patient response (ID search)
      if (searchType === 'id') {
        return { entry: [{ resource: data }] };
      }
      
      // Handle search results
      return data;
    },
    enabled: false, // Disable automatic execution
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });

  const patients = searchResult?.entry?.map((entry: any) => entry.resource) || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchType === 'id' && searchParams.id.trim()) {
      setHasSearched(true);
      refetch();
    } else if (searchType === 'name' && (searchParams.family.trim() || searchParams.given.trim())) {
      setHasSearched(true);
      refetch();
    }
  };

  const clearSearch = () => {
    setSearchParams({ family: '', given: '', id: '' });
    setHasSearched(false);
  };

  const formatPatientName = (patient: any) => {
    const name = patient.name?.[0];
    if (!name) return 'Unknown Patient';
    
    const given = name.given?.join(' ') || '';
    const family = name.family || '';
    
    return `${given} ${family}`.trim() || 'Unknown Patient';
  };

  const formatPatientInfo = (patient: any) => {
    const parts = [];
    
    if (patient.id) {
      parts.push(`ID: ${patient.id}`);
    }
    
    if (patient.birthDate) {
      const age = new Date().getFullYear() - new Date(patient.birthDate).getFullYear();
      parts.push(`Age: ${age}`);
    }
    
    if (patient.gender) {
      parts.push(`Gender: ${patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}`);
    }
    
    return parts.join(' • ') || 'No additional info';
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'Unknown';
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      <Card title="🔍 Patient Search">
        <form onSubmit={handleSearch} className="space-y-4 text-black">
          <div className="flex gap-4">
            <div className="flex-1">
              {searchType === 'name' ? (
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Enter patient first name..."
                    value={searchParams.given}
                    onChange={(value: string) => setSearchParams({ ...searchParams, given: value })}
                    className="w-full"
                  />
                  <Input
                    type="text"
                    placeholder="Enter patient last name..."
                    value={searchParams.family}
                    onChange={(value: string) => setSearchParams({ ...searchParams, family: value })}
                    className="w-full"
                  />
                </div>
              ) : (
                <Input
                  type="text"
                  placeholder="Enter patient ID..."
                  value={searchParams.id}
                  onChange={(value: string) => setSearchParams({ ...searchParams, id: value })}
                  className="w-full"
                />
              )}
            </div>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as 'name' | 'id')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Search by Name</option>
              <option value="id">Search by ID</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="primary" 
              disabled={
                (searchType === 'id' && !searchParams.id.trim()) ||
                (searchType === 'name' && !searchParams.family.trim() && !searchParams.given.trim()) ||
                isLoading
              }
            >
              {isLoading ? '🔄 Searching...' : '🔍 Search'}
            </Button>
            {hasSearched && (
              <Button variant="secondary" onClick={clearSearch}>
                ❌ Clear
              </Button>
            )}
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">Error: {error.message}</p>
          </div>
        )}

        {hasSearched && !isLoading && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">
              Search Results ({patients.length} found)
            </h3>
            
            {patients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No patients found matching your search criteria.</p>
                <p className="text-sm mt-2">Try adjusting your search term or search type.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {patients.map((patient: any) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {formatPatientName(patient)}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formatPatientInfo(patient)}
                      </p>
                      {patient.telecom?.find((t: any) => t.system === 'email') && (
                        <p className="text-xs text-gray-500">
                          📧 {patient.telecom.find((t: any) => t.system === 'email').value}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => onPatientSelect(patient.id)}
                      className="ml-4"
                    >
                      View Details →
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

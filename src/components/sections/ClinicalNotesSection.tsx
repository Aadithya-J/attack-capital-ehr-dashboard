'use client';

import { useState } from 'react';
import { useCompositions, useComposition, useCreateComposition } from '@/hooks/useCompositions';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function ClinicalNotesSection() {
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [searchForm, setSearchForm] = useState({
    patientId: ''
  });
  const [selectedCompositionId, setSelectedCompositionId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  const [newComposition, setNewComposition] = useState({
    patientId: '',
    practitionerId: '',
    title: '',
    note: '',
    date: ''
  });

  const { data: compositions, isLoading, error } = useCompositions(searchParams);
  const { data: selectedComposition } = useComposition(selectedCompositionId);
  const createComposition = useCreateComposition();

  const handleSearch = () => {
    const params: Record<string, string> = {};

    if (searchForm.patientId.trim()) {
      params.patient = searchForm.patientId.trim();
    }

    setSearchParams(params);
  };

  const handleClearSearch = () => {
    setSearchForm({
      patientId: ''
    });
    setSearchParams({});
  };

  const handleCreateComposition = async () => {
    if (!newComposition.patientId || !newComposition.practitionerId || !newComposition.title) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const compositionData = {
        resourceType: "Composition",
        status: "preliminary",
        type: {
          coding: [{
            system: "http://loinc.org",
            code: "11488-4",
            display: "Consult note"
          }]
        },
        category: [{
          coding: [{
            system: "http://loinc.org",
            code: "LP173421-1",
            display: "Report"
          }]
        }],
        subject: {
          reference: `Patient/${newComposition.patientId}`
        },
        author: [{
          reference: `Practitioner/${newComposition.practitionerId}`
        }],
        title: newComposition.title,
        date: newComposition.date || new Date().toISOString(),
        section: newComposition.note ? [
          {
            title: "Clinical Note",
            code: {
              coding: [
                {
                  system: "http://loinc.org",
                  code: "18776-5",
                  display: "Plan of treatment (narrative)"
                }
              ]
            },
            text: {
              status: "generated",
              div: `<div xmlns="http://www.w3.org/1999/xhtml">${newComposition.note}</div>`
            }
          }
        ] : []
      };

      await createComposition.mutateAsync(compositionData);

      alert('✅ Clinical note created successfully!');
      setIsCreating(false);
      setNewComposition({
        patientId: '',
        practitionerId: '',
        title: '',
        note: '',
        date: ''
      });
    } catch (error: any) {
      console.error('Failed to create clinical note:', error);
      const message = error?.response?.data?.error || error?.message || 'Failed to create clinical note';
      alert(message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preliminary': return 'text-yellow-700 bg-yellow-50 px-2 py-1 rounded text-xs';
      case 'final': return 'text-green-700 bg-green-50 px-2 py-1 rounded text-xs';
      case 'amended': return 'text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs';
      default: return 'text-gray-700 bg-gray-100 px-2 py-1 rounded text-xs';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Clinical Notes</h2>
        <Button onClick={() => setIsCreating(true)}>
          Add Clinical Note
        </Button>
      </div>

      {isCreating && (
        <Card title="Add New Clinical Note">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Patient ID"
              value={newComposition.patientId}
              onChange={(value) => setNewComposition(prev => ({ ...prev, patientId: value }))}
              required
            />
            <Input
              label="Practitioner ID"
              value={newComposition.practitionerId}
              onChange={(value) => setNewComposition(prev => ({ ...prev, practitionerId: value }))}
              placeholder="e.g., 256541"
              required
            />
            <Input
              label="Note Title"
              value={newComposition.title}
              onChange={(value) => setNewComposition(prev => ({ ...prev, title: value }))}
              placeholder="e.g., Follow-up regarding recent lab results"
              required
            />
            <Input
              label="Date"
              type="datetime-local"
              value={newComposition.date}
              onChange={(value) => setNewComposition(prev => ({ ...prev, date: value }))}
            />
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Clinical Note</label>
              <textarea
                value={newComposition.note}
                onChange={(e) => setNewComposition(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Enter clinical note details..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                rows={4}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleCreateComposition}
              disabled={createComposition.isPending}
            >
              {createComposition.isPending ? 'Creating...' : 'Create Clinical Note'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsCreating(false)}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <Card title="Search Clinical Notes">
        <div className="grid grid-cols-1 gap-4 max-w-md">
          <Input
            label="Patient ID"
            value={searchForm.patientId}
            placeholder="Enter patient ID (e.g., 256587)"
            onChange={(value) => setSearchForm(prev => ({ ...prev, patientId: value }))}
          />
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={handleSearch}>
            Search Notes
          </Button>
          <Button variant="secondary" onClick={handleClearSearch}>
            Clear Search
          </Button>
        </div>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error loading clinical notes: {error.message}</p>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <p>Loading clinical notes...</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Clinical Notes List</h3>
          <div className="space-y-3">
            {compositions?.map((composition) => (
              <Card key={composition.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">
                        {composition.title}
                      </h4>
                      <span className={getStatusColor(composition.status)}>
                        {composition.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 mb-1">
                      <strong className="text-gray-900">Patient:</strong> {composition.subject.display || composition.subject.reference}
                    </p>
                    {composition.author?.[0]?.display && (
                      <p className="text-sm text-gray-800 mb-1">
                        <strong className="text-gray-900">Author:</strong> {composition.author[0].display}
                      </p>
                    )}
                    {composition.type?.coding?.[0]?.display && (
                      <p className="text-sm text-gray-800 mb-1">
                        <strong className="text-gray-900">Type:</strong> {composition.type.coding[0].display}
                      </p>
                    )}
                    {composition.date && (
                      <p className="text-sm text-gray-800">
                        <strong className="text-gray-900">Date:</strong> {formatDate(composition.date)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      onClick={() => setSelectedCompositionId(composition.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {compositions?.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No clinical notes found. Try adjusting your search criteria.
              </p>
            )}
          </div>
        </div>

        {selectedComposition && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Clinical Note Details</h3>
            <Card>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Basic Information</h4>
                  <p className="text-gray-900"><strong>ID:</strong> {selectedComposition.id}</p>
                  <p className="text-gray-900"><strong>Title:</strong> {selectedComposition.title}</p>
                  <p className="text-gray-900"><strong>Status:</strong>
                    <span className={`ml-2 ${getStatusColor(selectedComposition.status)}`}>
                      {selectedComposition.status}
                    </span>
                  </p>
                  <p className="text-gray-900"><strong>Patient:</strong> {selectedComposition.subject.display || selectedComposition.subject.reference}</p>
                  {selectedComposition.date && (
                    <p className="text-gray-900"><strong>Date:</strong> {formatDate(selectedComposition.date)}</p>
                  )}
                </div>

                {selectedComposition.author && selectedComposition.author.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Authors</h4>
                    {selectedComposition.author.map((author, index) => (
                      <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                        <p className="text-gray-900">{author.display || author.reference}</p>
                      </div>
                    ))}
                  </div>
                )}

                {selectedComposition.type?.coding && (
                  <div>
                    <h4 className="font-medium mb-2">Type</h4>
                    {selectedComposition.type.coding.map((coding, index) => (
                      <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                        <p className="text-gray-900"><strong>Code:</strong> {coding.code}</p>
                        <p className="text-gray-900"><strong>Display:</strong> {coding.display}</p>
                      </div>
                    ))}
                  </div>
                )}

                {selectedComposition.section && selectedComposition.section.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Content</h4>
                    {selectedComposition.section.map((section, index) => (
                      <div key={index} className="mb-4 p-3 bg-gray-50 rounded">
                        {section.title && (
                          <h5 className="font-medium mb-2 text-gray-900">{section.title}</h5>
                        )}
                        {section.text?.div && (
                          <div
                            className="text-gray-900 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: section.text.div }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

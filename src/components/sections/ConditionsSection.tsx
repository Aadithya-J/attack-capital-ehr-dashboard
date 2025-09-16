'use client';

import { useState } from 'react';
import { useConditions, useCondition, useCreateCondition, useUpdateCondition } from '@/hooks/useConditions';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function ConditionsSection() {
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [selectedConditionId, setSelectedConditionId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [newCondition, setNewCondition] = useState({
    patientId: '',
    conditionCode: '',
    conditionDisplay: '',
    clinicalStatus: 'active',
    verificationStatus: 'confirmed',
    severity: '',
    onsetDate: '',
    notes: ''
  });

  const { data: conditions, isLoading, error } = useConditions(searchParams);
  const { data: selectedCondition } = useCondition(selectedConditionId);
  const createCondition = useCreateCondition();
  const updateCondition = useUpdateCondition();

  const handleSearch = (field: string, value: string) => {
    if (value.trim()) {
      setSearchParams({ [field]: value });
    } else {
      setSearchParams({});
    }
  };

  const handleCreateCondition = async () => {
    if (!newCondition.patientId || !newCondition.conditionCode) {
      alert('Please fill in required fields');
      return;
    }

    try {
      await createCondition.mutateAsync({
        subject: {
          reference: `Patient/${newCondition.patientId}`
        },
        code: {
          coding: [{
            code: newCondition.conditionCode,
            display: newCondition.conditionDisplay || newCondition.conditionCode
          }],
          text: newCondition.conditionDisplay || newCondition.conditionCode
        },
        clinicalStatus: {
          coding: [{
            code: newCondition.clinicalStatus,
            display: newCondition.clinicalStatus
          }]
        },
        verificationStatus: {
          coding: [{
            code: newCondition.verificationStatus,
            display: newCondition.verificationStatus
          }]
        },
        ...(newCondition.severity && {
          severity: {
            coding: [{
              code: newCondition.severity,
              display: newCondition.severity
            }]
          }
        }),
        ...(newCondition.onsetDate && {
          onsetDateTime: newCondition.onsetDate
        }),
        ...(newCondition.notes && {
          note: [{
            text: newCondition.notes
          }]
        }),
        recordedDate: new Date().toISOString()
      });
      
      setIsCreating(false);
      setNewCondition({
        patientId: '',
        conditionCode: '',
        conditionDisplay: '',
        clinicalStatus: 'active',
        verificationStatus: 'confirmed',
        severity: '',
        onsetDate: '',
        notes: ''
      });
    } catch (error) {
      console.error('Failed to create condition:', error);
      alert('Failed to create condition');
    }
  };

  const handleUpdateStatus = async (conditionId: string, newStatus: string) => {
    try {
      await updateCondition.mutateAsync({
        conditionId,
        data: {
          clinicalStatus: {
            coding: [{
              code: newStatus,
              display: newStatus
            }]
          }
        }
      });
    } catch (error) {
      console.error('Failed to update condition:', error);
      alert('Failed to update condition');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600';
      case 'inactive': return 'text-gray-600';
      case 'resolved': return 'text-green-600';
      case 'remission': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'text-red-600';
      case 'moderate': return 'text-orange-600';
      case 'mild': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Conditions</h2>
        <Button onClick={() => setIsCreating(true)}>
          Add Condition
        </Button>
      </div>

      {isCreating && (
        <Card title="Add New Condition">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Patient ID"
              value={newCondition.patientId}
              onChange={(value) => setNewCondition(prev => ({ ...prev, patientId: value }))}
              required
            />
            <Input
              label="Condition Code"
              value={newCondition.conditionCode}
              onChange={(value) => setNewCondition(prev => ({ ...prev, conditionCode: value }))}
              placeholder="ICD-10 or SNOMED code"
              required
            />
            <Input
              label="Condition Description"
              value={newCondition.conditionDisplay}
              onChange={(value) => setNewCondition(prev => ({ ...prev, conditionDisplay: value }))}
              placeholder="Human readable description"
            />
            <Input
              label="Onset Date"
              type="date"
              value={newCondition.onsetDate}
              onChange={(value) => setNewCondition(prev => ({ ...prev, onsetDate: value }))}
            />
            <div>
              <label className="block text-sm font-medium mb-1">Clinical Status</label>
              <select
                value={newCondition.clinicalStatus}
                onChange={(e) => setNewCondition(prev => ({ ...prev, clinicalStatus: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="resolved">Resolved</option>
                <option value="remission">Remission</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Verification Status</label>
              <select
                value={newCondition.verificationStatus}
                onChange={(e) => setNewCondition(prev => ({ ...prev, verificationStatus: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="confirmed">Confirmed</option>
                <option value="provisional">Provisional</option>
                <option value="differential">Differential</option>
                <option value="unconfirmed">Unconfirmed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Severity</label>
              <select
                value={newCondition.severity}
                onChange={(e) => setNewCondition(prev => ({ ...prev, severity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select severity</option>
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>
            <div className="col-span-2">
              <Input
                label="Notes"
                value={newCondition.notes}
                onChange={(value) => setNewCondition(prev => ({ ...prev, notes: value }))}
                placeholder="Additional notes about the condition"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={handleCreateCondition}
              disabled={createCondition.isPending}
            >
              {createCondition.isPending ? 'Creating...' : 'Create Condition'}
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

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Search by Patient"
          value=""
          placeholder="Enter patient name or ID"
          onChange={(value) => handleSearch('patient', value)}
        />
        <Input
          label="Search by Condition"
          value=""
          placeholder="Enter condition code or description"
          onChange={(value) => handleSearch('code', value)}
        />
        <Input
          label="Search by Clinical Status"
          value=""
          placeholder="active, inactive, resolved"
          onChange={(value) => handleSearch('clinical-status', value)}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error loading conditions: {error.message}</p>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <p>Loading conditions...</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Conditions List</h3>
          <div className="space-y-3">
            {conditions?.map((condition) => (
              <Card key={condition.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">
                        {condition.code?.text || condition.code?.coding?.[0]?.display || 'Unknown Condition'}
                      </h4>
                      {condition.severity?.coding?.[0]?.code && (
                        <span className={`text-sm font-medium ${getSeverityColor(condition.severity.coding[0].code)}`}>
                          {condition.severity.coding[0].display?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mb-2">
                      <span className={`text-sm font-medium ${getStatusColor(condition.clinicalStatus?.coding?.[0]?.code || '')}`}>
                        {condition.clinicalStatus?.coding?.[0]?.display?.toUpperCase() || 'UNKNOWN'}
                      </span>
                      <span className="text-sm text-gray-600">
                        {condition.verificationStatus?.coding?.[0]?.display}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Patient:</strong> {condition.subject.display || condition.subject.reference}
                    </p>
                    {condition.code?.coding?.[0]?.code && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Code:</strong> {condition.code.coding[0].code}
                      </p>
                    )}
                    {condition.onsetDateTime && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Onset:</strong> {formatDate(condition.onsetDateTime)}
                      </p>
                    )}
                    {condition.recordedDate && (
                      <p className="text-sm text-gray-600">
                        <strong>Recorded:</strong> {formatDate(condition.recordedDate)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      onClick={() => setSelectedConditionId(condition.id)}
                    >
                      View Details
                    </Button>
                    {condition.clinicalStatus?.coding?.[0]?.code === 'active' && (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => handleUpdateStatus(condition.id, 'inactive')}
                        >
                          Mark Inactive
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleUpdateStatus(condition.id, 'resolved')}
                        >
                          Mark Resolved
                        </Button>
                      </>
                    )}
                    {condition.clinicalStatus?.coding?.[0]?.code === 'inactive' && (
                      <Button
                        onClick={() => handleUpdateStatus(condition.id, 'active')}
                      >
                        Reactivate
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            {conditions?.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No conditions found. Try adjusting your search criteria.
              </p>
            )}
          </div>
        </div>

        {selectedCondition && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Condition Details</h3>
            <Card>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Basic Information</h4>
                  <p><strong>ID:</strong> {selectedCondition.id}</p>
                  <p><strong>Condition:</strong> {selectedCondition.code?.text || selectedCondition.code?.coding?.[0]?.display}</p>
                  <p><strong>Clinical Status:</strong> 
                    <span className={`ml-2 ${getStatusColor(selectedCondition.clinicalStatus?.coding?.[0]?.code || '')}`}>
                      {selectedCondition.clinicalStatus?.coding?.[0]?.display?.toUpperCase()}
                    </span>
                  </p>
                  <p><strong>Verification Status:</strong> {selectedCondition.verificationStatus?.coding?.[0]?.display}</p>
                  <p><strong>Patient:</strong> {selectedCondition.subject.display || selectedCondition.subject.reference}</p>
                </div>

                {selectedCondition.code?.coding && (
                  <div>
                    <h4 className="font-medium mb-2">Coding Information</h4>
                    {selectedCondition.code.coding.map((coding, index) => (
                      <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                        <p><strong>Code:</strong> {coding.code}</p>
                        <p><strong>Display:</strong> {coding.display}</p>
                        {coding.system && <p><strong>System:</strong> {coding.system}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {selectedCondition.severity && (
                  <div>
                    <h4 className="font-medium mb-2">Severity</h4>
                    <p className={getSeverityColor(selectedCondition.severity.coding?.[0]?.code || '')}>
                      {selectedCondition.severity.coding?.[0]?.display}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Timeline</h4>
                  {selectedCondition.onsetDateTime && (
                    <p><strong>Onset Date:</strong> {formatDate(selectedCondition.onsetDateTime)}</p>
                  )}
                  {selectedCondition.recordedDate && (
                    <p><strong>Recorded Date:</strong> {formatDate(selectedCondition.recordedDate)}</p>
                  )}
                  {selectedCondition.recorder && (
                    <p><strong>Recorded By:</strong> {selectedCondition.recorder.display || selectedCondition.recorder.reference}</p>
                  )}
                </div>

                {selectedCondition.note && selectedCondition.note.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Notes</h4>
                    {selectedCondition.note.map((note, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded mb-2">
                        <p>{note.text}</p>
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

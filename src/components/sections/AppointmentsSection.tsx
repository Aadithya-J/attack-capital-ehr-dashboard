'use client';

import { useState } from 'react';
import { useAppointments, useAppointment, useCreateAppointment, useUpdateAppointment } from '@/hooks/useAppointments';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function AppointmentsSection() {
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    status: 'booked',
    start: '',
    end: '',
    appointmentType: '',
    patientId: '',
    practitionerId: ''
  });

  const { data: appointments, isLoading, error } = useAppointments(searchParams);
  const { data: selectedAppointment } = useAppointment(selectedAppointmentId);
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();

  const handleSearch = (field: string, value: string) => {
    if (value.trim()) {
      setSearchParams({ [field]: value });
    } else {
      setSearchParams({});
    }
  };

  const handleCreateAppointment = async () => {
    if (!newAppointment.start || !newAppointment.end || !newAppointment.patientId) {
      alert('Please fill in required fields');
      return;
    }

    try {
      await createAppointment.mutateAsync({
        status: newAppointment.status,
        start: newAppointment.start,
        end: newAppointment.end,
        participant: [
          {
            actor: {
              reference: `Patient/${newAppointment.patientId}`,
              display: 'Patient'
            },
            status: 'accepted'
          },
          ...(newAppointment.practitionerId ? [{
            actor: {
              reference: `Practitioner/${newAppointment.practitionerId}`,
              display: 'Practitioner'
            },
            status: 'accepted'
          }] : [])
        ],
        ...(newAppointment.appointmentType && {
          appointmentType: {
            coding: [{
              code: newAppointment.appointmentType,
              display: newAppointment.appointmentType
            }]
          }
        })
      });
      
      setIsCreating(false);
      setNewAppointment({
        status: 'booked',
        start: '',
        end: '',
        appointmentType: '',
        patientId: '',
        practitionerId: ''
      });
    } catch (error) {
      console.error('Failed to create appointment:', error);
      alert('Failed to create appointment');
    }
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      await updateAppointment.mutateAsync({
        appointmentId,
        data: { status: newStatus }
      });
    } catch (error) {
      console.error('Failed to update appointment:', error);
      alert('Failed to update appointment');
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked': return 'text-green-800 bg-green-50 px-2 py-1 rounded text-xs';
      case 'cancelled': return 'text-red-800 bg-red-50 px-2 py-1 rounded text-xs';
      case 'fulfilled': return 'text-blue-800 bg-blue-50 px-2 py-1 rounded text-xs';
      case 'noshow': return 'text-orange-800 bg-orange-50 px-2 py-1 rounded text-xs';
      default: return 'text-gray-800 bg-gray-100 px-2 py-1 rounded text-xs';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl text-gray-900 font-bold">Appointments</h2>
        <Button onClick={() => setIsCreating(true)}>
          Schedule Appointment
        </Button>
      </div>

      {isCreating && (
        <Card title="Schedule New Appointment">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Patient ID"
              value={newAppointment.patientId}
              onChange={(value) => setNewAppointment(prev => ({ ...prev, patientId: value }))}
              required
            />
            <Input
              label="Practitioner ID"
              value={newAppointment.practitionerId}
              onChange={(value) => setNewAppointment(prev => ({ ...prev, practitionerId: value }))}
            />
            <Input
              label="Start Date/Time"
              type="datetime-local"
              value={newAppointment.start}
              onChange={(value) => setNewAppointment(prev => ({ ...prev, start: value }))}
              required
            />
            <Input
              label="End Date/Time"
              type="datetime-local"
              value={newAppointment.end}
              onChange={(value) => setNewAppointment(prev => ({ ...prev, end: value }))}
              required
            />
            <Input
              label="Appointment Type"
              value={newAppointment.appointmentType}
              onChange={(value) => setNewAppointment(prev => ({ ...prev, appointmentType: value }))}
            />
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={newAppointment.status}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="booked">Booked</option>
                <option value="pending">Pending</option>
                <option value="arrived">Arrived</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={handleCreateAppointment}
              disabled={createAppointment.isPending}
            >
              {createAppointment.isPending ? 'Creating...' : 'Create Appointment'}
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
          label="Search by Practitioner"
          value=""
          placeholder="Enter practitioner name or ID"
          onChange={(value) => handleSearch('practitioner', value)}
        />
        <Input
          label="Search by Date"
          value=""
          type="date"
          onChange={(value) => handleSearch('date', value)}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error loading appointments: {error.message}</p>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <p>Loading appointments...</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Appointments List</h3>
          <div className="space-y-3">
            {appointments?.map((appointment) => (
              <Card key={appointment.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </span>
                      {appointment.appointmentType?.coding?.[0]?.display && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                          {appointment.appointmentType.coding[0].display}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800 mb-1">
                      <strong className="text-gray-900">Start:</strong> {formatDateTime(appointment.start)}
                    </p>
                    <p className="text-sm text-gray-800 mb-2">
                      <strong className="text-gray-900">End:</strong> {formatDateTime(appointment.end)}
                    </p>
                    <div className="text-sm">
                      {appointment.participant?.map((participant, index) => (
                        <p key={index} className="text-gray-800">
                          <strong className="text-gray-900">{participant.actor.display}:</strong> {participant.actor.reference}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      onClick={() => setSelectedAppointmentId(appointment.id)}
                    >
                      View Details
                    </Button>
                    {appointment.status === 'booked' && (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => handleUpdateStatus(appointment.id, 'arrived')}
                        >
                          Mark Arrived
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {appointment.status === 'arrived' && (
                      <Button
                        onClick={() => handleUpdateStatus(appointment.id, 'fulfilled')}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            {appointments?.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No appointments found. Try adjusting your search criteria.
              </p>
            )}
          </div>
        </div>

        {selectedAppointment && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Appointment Details</h3>
            <Card>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Basic Information</h4>
                  <p className="text-gray-900"><strong>ID:</strong> {selectedAppointment.id}</p>
                  <p className="text-gray-900"><strong>Status:</strong> 
                    <span className={`ml-2 ${getStatusColor(selectedAppointment.status)}`}>
                      {selectedAppointment.status}
                    </span>
                  </p>
                  <p className="text-gray-900"><strong>Start:</strong> {formatDateTime(selectedAppointment.start)}</p>
                  <p className="text-gray-900"><strong>End:</strong> {formatDateTime(selectedAppointment.end)}</p>
                </div>

                {selectedAppointment.appointmentType && (
                  <div>
                    <h4 className="font-medium mb-2">Appointment Type</h4>
                    {selectedAppointment.appointmentType.coding?.map((coding, index) => (
                      <p key={index} className="text-gray-900">
                        <strong>Code:</strong> {coding.code} - {coding.display}
                      </p>
                    ))}
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Participants</h4>
                  {selectedAppointment.participant?.map((participant, index) => (
                    <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                      <p className="text-gray-900"><strong>Type:</strong> {participant.actor.display}</p>
                      <p className="text-gray-900"><strong>Reference:</strong> {participant.actor.reference}</p>
                      <p className="text-gray-900"><strong>Status:</strong> {participant.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

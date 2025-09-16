'use client';

import { useState } from 'react';
import { useAppointments, useAppointment, useCreateAppointment, useUpdateAppointment } from '@/hooks/useAppointments';
import { useSlots } from '@/hooks/useSlots';
import { useAppointmentTypes } from '@/hooks/useAppointmentTypes';
import { useLocations, getLocationName } from '@/hooks/useLocations';
import { usePractitioners, getPractitionerName } from '@/hooks/usePractitioners';
import { usePatients } from '@/hooks/usePatients';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function AppointmentsSection() {
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);
  
  // Search filters
  const [filters, setFilters] = useState({
    patientName: '',
    practitionerId: '',
    status: '',
    startDate: '',
    endDate: '',
    appointmentType: ''
  });

  // Availability search params
  const [availabilityParams, setAvailabilityParams] = useState({
    appointmentType: '',
    practitionerId: '',
    locationId: '',
    startDate: '',
    endDate: ''
  });

  const [newAppointment, setNewAppointment] = useState({
    status: 'booked',
    date: '',
    startTime: '',
    endTime: '',
    appointmentType: '',
    patientId: '',
    practitionerId: '',
    locationId: '',
    comment: ''
  });

  const { data: appointments, isLoading, error } = useAppointments(searchParams);
  const { data: selectedAppointment } = useAppointment(selectedAppointmentId);
  const { data: availableSlots, isLoading: slotsLoading } = useSlots(availabilityParams);
  const { data: appointmentTypes } = useAppointmentTypes();
  const { data: locations } = useLocations();
  const { data: practitioners } = usePractitioners();
  const { data: patients } = usePatients({});
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();

  const handleSearch = () => {
    const params: Record<string, string> = {};
    
    if (filters.patientName) {
      params.patient = filters.patientName;
    }
    
    if (filters.practitionerId) {
      params.practitioner = filters.practitionerId;
    }
    
    if (filters.status) {
      params.status = filters.status;
    }
    
    if (filters.startDate) {
      params.date = `ge${filters.startDate}`;
    }
    
    if (filters.endDate) {
      params.date = params.date ? `${params.date}&date=le${filters.endDate}` : `le${filters.endDate}`;
    }
    
    if (filters.appointmentType) {
      params['appointment-type'] = filters.appointmentType;
    }
    
    setSearchParams(params);
  };

  const handleCheckAvailability = () => {
    if (availabilityParams.appointmentType && availabilityParams.startDate && 
        (availabilityParams.practitionerId || availabilityParams.locationId)) {
      setShowAvailability(true);
    } else {
      alert('Please select appointment type, date, and either practitioner or location');
    }
  };

  const handleCreateAppointment = async () => {
    if (!newAppointment.date || !newAppointment.startTime || !newAppointment.endTime || !newAppointment.patientId) {
      alert('Please fill in required fields: date, start time, end time, and patient');
      return;
    }

    try {
      // Combine date and time for API (ISO format)
      const startDateTime = `${newAppointment.date}T${newAppointment.startTime}:00Z`;
      const endDateTime = `${newAppointment.date}T${newAppointment.endTime}:00Z`;

      // Calculate duration in minutes
      const startTime = new Date(`${newAppointment.date}T${newAppointment.startTime}:00`);
      const endTime = new Date(`${newAppointment.date}T${newAppointment.endTime}:00`);
      const minutesDuration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      const participants = [
        {
          actor: {
            reference: `Patient/${newAppointment.patientId}`
          },
          status: 'accepted'
        }
      ];

      if (newAppointment.practitionerId) {
        participants.push({
          actor: {
            reference: `Practitioner/${newAppointment.practitionerId}`
          },
          status: 'accepted'
        });
      }

      if (newAppointment.locationId) {
        participants.push({
          actor: {
            reference: `Location/${newAppointment.locationId}`
          },
          status: 'accepted'
        });
      }

      const appointmentData: any = {
        resourceType: 'Appointment',
        status: newAppointment.status,
        start: startDateTime,
        end: endDateTime,
        minutesDuration: minutesDuration,
        participant: participants
      };

      if (newAppointment.appointmentType) {
        const selectedType = appointmentTypes?.find(type => type.code === newAppointment.appointmentType);
        appointmentData.appointmentType = {
          coding: [{
            system: selectedType?.system || 'https://stage.ema-api.com/ema-dev/firm/entpmsandbox393/ema/fhir/v2/ValueSet/appointment-type',
            code: newAppointment.appointmentType,
            display: selectedType?.display || newAppointment.appointmentType
          }],
          text: selectedType?.display || newAppointment.appointmentType
        };
      }

      if (newAppointment.comment) {
        appointmentData.description = newAppointment.comment;
      }
      
      await createAppointment.mutateAsync(appointmentData);
      
      setIsCreating(false);
      setNewAppointment({
        status: 'booked',
        date: '',
        startTime: '',
        endTime: '',
        appointmentType: '',
        patientId: '',
        practitionerId: '',
        locationId: '',
        comment: ''
      });
      alert('Appointment created successfully!');
    } catch (error) {
      console.error('Failed to create appointment:', error);
      alert('Failed to create appointment. Please check the details and try again.');
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
        <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
        <Button onClick={() => setIsCreating(true)}>
          Schedule Appointment
        </Button>
      </div>

      {isCreating && (
        <Card title="Schedule New Appointment">
          <div className="grid grid-cols-2 gap-4 text-black">
            <div>
              <label className="block text-sm font-medium mb-1">Patient *</label>
              <select
                value={newAppointment.patientId}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, patientId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Patient</option>
                {patients?.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name?.[0] ? `${patient.name[0].given?.join(' ') || ''} ${patient.name[0].family || ''}`.trim() || `Patient ${patient.id}` : `Patient ${patient.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Practitioner</label>
              <select
                value={newAppointment.practitionerId}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, practitionerId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Practitioner</option>
                {practitioners?.map((practitioner) => (
                  <option key={practitioner.id} value={practitioner.id}>
                    {getPractitionerName(practitioner)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <select
                value={newAppointment.locationId}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, locationId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Location</option>
                {locations?.map((location) => (
                  <option key={location.id} value={location.id}>
                    {getLocationName(location)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-black text-sm font-medium mb-1">Appointment Type</label>
              <select
                value={newAppointment.appointmentType}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, appointmentType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Type</option>
                {appointmentTypes?.map((type) => (
                  <option key={type.code} value={type.code}>
                    {type.display}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Appointment Date *"
              type="date"
              value={newAppointment.date}
              onChange={(value) => setNewAppointment(prev => ({ ...prev, date: value }))}
              required
            />

            <Input
              label="Start Time *"
              type="time"
              value={newAppointment.startTime}
              onChange={(value) => setNewAppointment(prev => ({ ...prev, startTime: value }))}
              required
            />

            <Input
              label="End Time *"
              type="time"
              value={newAppointment.endTime}
              onChange={(value) => setNewAppointment(prev => ({ ...prev, endTime: value }))}
              required
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

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Comments</label>
              <textarea
                value={newAppointment.comment}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, comment: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Additional notes or comments..."
              />
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

      {/* Availability Checker */}
      <Card title="Check Availability">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-black">
          <div>
            <label className="block text-sm text-black font-medium mb-1">Appointment Type *</label>
            <select
              value={availabilityParams.appointmentType}
              onChange={(e) => setAvailabilityParams(prev => ({ ...prev, appointmentType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Type</option>
              {appointmentTypes?.map((type) => (
                <option key={type.code} value={type.code}>
                  {type.display}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Practitioner</label>
            <select
              value={availabilityParams.practitionerId}
              onChange={(e) => setAvailabilityParams(prev => ({ ...prev, practitionerId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Any Practitioner</option>
              {practitioners?.map((practitioner) => (
                <option key={practitioner.id} value={practitioner.id}>
                  {getPractitionerName(practitioner)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <select
              value={availabilityParams.locationId}
              onChange={(e) => setAvailabilityParams(prev => ({ ...prev, locationId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Any Location</option>
              {locations?.map((location) => (
                <option key={location.id} value={location.id}>
                  {getLocationName(location)}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Start Date *"
            value={availabilityParams.startDate}
            type="date"
            onChange={(value) => setAvailabilityParams(prev => ({ ...prev, startDate: value }))}
          />

          <Input
            label="End Date"
            value={availabilityParams.endDate}
            type="date"
            onChange={(value) => setAvailabilityParams(prev => ({ ...prev, endDate: value }))}
          />
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button onClick={handleCheckAvailability}>
            Check Availability
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowAvailability(false);
              setAvailabilityParams({
                appointmentType: '',
                practitionerId: '',
                locationId: '',
                startDate: '',
                endDate: ''
              });
            }}
          >
            Clear
          </Button>
        </div>

        {showAvailability && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium mb-2 text-black">Available Slots</h4>
            {slotsLoading ? (
              <p>Loading available slots...</p>
            ) : availableSlots && availableSlots.length > 0 ? (
              <div className="space-y-2 text-black">
                {availableSlots.map((slot) => (
                  <div key={slot.id} className="flex justify-between items-center p-2 bg-white rounded border">
                    <div>
                      <p className="font-medium">
                        {new Date(slot.start).toLocaleString()} - {new Date(slot.end).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Status: {slot.status}</p>
                      {slot.serviceType && (
                        <p className="text-sm text-gray-600">
                          Service: {slot.serviceType[0]?.coding?.[0]?.display}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => {
                        // Extract date and time from slot
                        const startDate = new Date(slot.start);
                        const endDate = new Date(slot.end);
                        
                        const date = startDate.toISOString().split('T')[0];
                        const startTime = startDate.toTimeString().slice(0, 5);
                        const endTime = endDate.toTimeString().slice(0, 5);

                        setNewAppointment(prev => ({
                          ...prev,
                          date: date,
                          startTime: startTime,
                          endTime: endTime,
                          appointmentType: availabilityParams.appointmentType,
                          practitionerId: availabilityParams.practitionerId,
                          locationId: availabilityParams.locationId
                        }));
                        setIsCreating(true);
                        setShowAvailability(false);
                      }}
                    >
                      Book This Slot
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No available slots found for the selected criteria.</p>
            )}
          </div>
        )}
      </Card>

      {/* Enhanced Search Filters */}
      <Card title="Search & Filter Appointments">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-black">
          <Input
            label="Patient Name/ID"
            value={filters.patientName}
            placeholder="Enter patient name or ID"
            onChange={(value) => setFilters(prev => ({ ...prev, patientName: value }))}
          />
          
          <div>
            <label className="block text-sm font-medium mb-1">Practitioner</label>
            <select
              value={filters.practitionerId}
              onChange={(e) => setFilters(prev => ({ ...prev, practitionerId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Practitioners</option>
              {practitioners?.map((practitioner) => (
                <option key={practitioner.id} value={practitioner.id}>
                  {getPractitionerName(practitioner)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Statuses</option>
              <option value="booked">Booked</option>
              <option value="pending">Pending</option>
              <option value="arrived">Arrived</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
              <option value="noshow">No Show</option>
            </select>
          </div>

          <Input
            label="Start Date"
            value={filters.startDate}
            type="date"
            onChange={(value) => setFilters(prev => ({ ...prev, startDate: value }))}
          />

          <Input
            label="End Date"
            value={filters.endDate}
            type="date"
            onChange={(value) => setFilters(prev => ({ ...prev, endDate: value }))}
          />

          <div>
            <label className="block text-sm text-black font-medium mb-1">Appointment Type</label>
            <select
              value={filters.appointmentType}
              onChange={(e) => setFilters(prev => ({ ...prev, appointmentType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Types</option>
              {appointmentTypes?.map((type) => (
                <option key={type.code} value={type.code}>
                  {type.display}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button onClick={handleSearch}>
            Search Appointments
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => {
              setFilters({
                patientName: '',
                practitionerId: '',
                status: '',
                startDate: '',
                endDate: '',
                appointmentType: ''
              });
              setSearchParams({});
            }}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

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
          <h3 className="text-lg text-black font-semibold mb-4">Appointments List</h3>
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

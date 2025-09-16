// Appointment FHIR resource types

import { FHIRMeta, FHIRCodeableConcept, FHIRReference, FHIRIdentifier, FHIRBundle } from './base';

export interface FHIRParticipant {
  actor: FHIRReference;
  status?: "accepted" | "declined" | "tentative" | "needs-action";
}

export interface FHIRSupportingInformation {
  identifier: FHIRIdentifier;
  display: string;
}

export interface Appointment {
  resourceType: "Appointment";
  id: string;
  meta: FHIRMeta;
  status: "proposed" | "pending" | "booked" | "arrived" | "fulfilled" | "cancelled" | "noshow" | "entered-in-error" | "checked-in" | "waitlist";
  appointmentType: FHIRCodeableConcept;
  reasonCode: FHIRCodeableConcept[];
  description?: string;
  supportingInformation: FHIRSupportingInformation[];
  start: string;
  end: string;
  minutesDuration: number;
  created: string;
  participant: FHIRParticipant[];
}

// Appointment-specific Bundle type
export type AppointmentBundle = FHIRBundle<Appointment>;

// Appointment API request types
export interface AppointmentCreateRequest {
  resourceType: "Appointment";
  status: "booked" | "pending" | "proposed";
  description?: string;
  minutesDuration: number;
  appointmentType: FHIRCodeableConcept;
  start: string;
  end: string;
  participant: FHIRParticipant[];
}

export interface AppointmentUpdateRequest {
  resourceType: "Appointment";
  id: string;
  status: "proposed" | "pending" | "booked" | "arrived" | "fulfilled" | "cancelled" | "noshow" | "entered-in-error" | "checked-in" | "waitlist";
}

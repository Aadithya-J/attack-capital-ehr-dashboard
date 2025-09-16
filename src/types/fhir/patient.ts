// Patient FHIR resource types

import { FHIRMeta, FHIRExtension, FHIRIdentifier, FHIRCodeableConcept, FHIRBundle } from './base';

export interface FHIRHumanName {
  family: string;
  given: string[];
}

export interface FHIRContactPoint {
  system: "phone" | "email" | "fax" | "pager" | "url" | "sms" | "other";
  value: string;
  use?: "home" | "work" | "temp" | "old" | "mobile";
  rank?: number;
}

export interface FHIRAddress {
  use: "home" | "work" | "temp" | "old" | "billing";
  type: "postal" | "physical" | "both";
  line: string[];
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}

export interface Patient {
  resourceType: "Patient";
  id: string;
  meta: FHIRMeta;
  extension?: FHIRExtension[];
  identifier: FHIRIdentifier[];
  active: boolean;
  name: FHIRHumanName[];
  telecom: FHIRContactPoint[];
  gender: "male" | "female" | "other" | "unknown";
  birthDate: string;
  deceasedBoolean: boolean;
  address: FHIRAddress[];
  maritalStatus: FHIRCodeableConcept;
}

// Patient-specific Bundle type
export type PatientBundle = FHIRBundle<Patient>;

// Patient API request/response types
export interface PatientUpdateRequest {
  resourceType: "Patient";
  id: string;
  telecom?: FHIRContactPoint[];
  name?: FHIRHumanName[];
  address?: FHIRAddress[];
  // Add other updatable fields as needed
}

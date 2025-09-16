// Encounter FHIR resource types

import { FHIRMeta, FHIRCodeableConcept, FHIRReference, FHIRBundle } from './base';

export interface FHIRPeriod {
  start: string;
  end?: string;
}

export interface FHIREncounterParticipant {
  type: FHIRCodeableConcept[];
  individual: FHIRReference;
}

export interface FHIREncounterLocation {
  location: FHIRReference;
}

export interface Encounter {
  resourceType: "Encounter";
  id: string;
  meta: FHIRMeta;
  status: "planned" | "arrived" | "triaged" | "in-progress" | "onleave" | "finished" | "cancelled" | "entered-in-error" | "unknown";
  class: {
    system: string;
    code: string;
    display: string;
  };
  type: FHIRCodeableConcept[];
  subject: FHIRReference;
  participant: FHIREncounterParticipant[];
  period: FHIRPeriod;
  location: FHIREncounterLocation[];
}

// Encounter-specific Bundle type
export type EncounterBundle = FHIRBundle<Encounter>;

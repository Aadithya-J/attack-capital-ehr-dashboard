// Slot FHIR resource types

import { FHIRIdentifier, FHIRBundle } from './base';

export interface FHIRSchedule {
  display: string;
}

export interface Slot {
  resourceType: "Slot";
  id: string;
  identifier: FHIRIdentifier[];
  schedule: FHIRSchedule;
  status: "free" | "busy" | "busy-unavailable" | "busy-tentative" | "entered-in-error";
  start: string;
  end: string;
}

// Slot-specific Bundle type
export type SlotBundle = FHIRBundle<Slot>;

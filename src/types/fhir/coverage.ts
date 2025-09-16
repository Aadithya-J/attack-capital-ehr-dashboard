// Coverage FHIR resource types

import { FHIRMeta, FHIRCodeableConcept, FHIRReference, FHIRBundle } from './base';

export interface FHIRCoverageClass {
  type: FHIRCodeableConcept;
  value: string;
}

export interface FHIRPolicyHolder {
  display: string;
}

export interface Coverage {
  resourceType: "Coverage";
  id: string;
  meta: FHIRMeta;
  status: "active" | "cancelled" | "draft" | "entered-in-error";
  policyHolder: FHIRPolicyHolder;
  beneficiary: FHIRReference;
  relationship: FHIRCodeableConcept;
  class: FHIRCoverageClass[];
  order: number;
}

// Coverage-specific Bundle type
export type CoverageBundle = FHIRBundle<Coverage>;

// Condition FHIR resource types

import { FHIRMeta, FHIRCodeableConcept, FHIRReference, FHIRBundle, FHIRIdentifier } from './base';

export interface Condition {
  resourceType: "Condition";
  id?: string;
  meta?: FHIRMeta;
  identifier?: FHIRIdentifier[];
  clinicalStatus: FHIRCodeableConcept;
  verificationStatus?: FHIRCodeableConcept;
  category: FHIRCodeableConcept[];
  severity?: FHIRCodeableConcept;
  code: FHIRCodeableConcept;
  subject: FHIRReference;
  encounter?: FHIRReference;
  onsetDateTime?: string;
  onsetAge?: any;
  onsetPeriod?: any;
  onsetRange?: any;
  onsetString?: string;
  abatementDateTime?: string;
  abatementAge?: any;
  abatementPeriod?: any;
  abatementRange?: any;
  abatementString?: string;
  recordedDate?: string;
  recorder?: FHIRReference;
  asserter?: FHIRReference;
  stage?: any[];
  evidence?: any[];
  note?: any[];
}

// Condition-specific Bundle type
export type ConditionBundle = FHIRBundle<Condition>;


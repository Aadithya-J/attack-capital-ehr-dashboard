// Account FHIR resource types

import { FHIRReference, FHIRBundle } from './base';

export interface FHIRGuarantor {
  party: FHIRReference;
}

export interface FHIRMoney {
  value: number;
  currency: string;
}

export interface Account {
  resourceType: "Account";
  id: string;
  subject: FHIRReference[];
  guarantor: FHIRGuarantor[];
  outstandingBalance: FHIRMoney[];
  unusedFunds: FHIRMoney[];
  businessUnitId: string[];
  businessUnitName: string[];
}

// Account-specific Bundle type
export type AccountBundle = FHIRBundle<Account>;

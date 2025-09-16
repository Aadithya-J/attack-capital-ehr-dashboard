// Base FHIR types used across all resources

export interface FHIRMeta {
  lastUpdated: string;
}

export interface FHIRCoding {
  system: string;
  code: string;
  display: string;
}

export interface FHIRCodeableConcept {
  coding: FHIRCoding[];
  text: string;
}

export interface FHIRExtension {
  url: string;
  extension?: FHIRExtension[];
  valueCoding?: FHIRCoding;
  valueString?: string;
}

export interface FHIRIdentifier {
  system: string;
  value: string;
}

export interface FHIRReference {
  reference: string;
  display: string;
}

export interface FHIRBundleLink {
  relation: string;
  url: string;
}

// Generic Bundle structure
export interface FHIRBundle<T> {
  resourceType: "Bundle";
  id: string;
  meta: FHIRMeta;
  type: "searchset";
  total: number;
  link: FHIRBundleLink[];
  entry: Array<{
    fullUrl: string;
    resource: T;
  }>;
}

// OperationOutcome FHIR resource types

export interface FHIRIssueDetails {
  text: string;
}

export interface FHIRIssue {
  severity: "fatal" | "error" | "warning" | "information";
  code: "invalid" | "structure" | "required" | "value" | "invariant" | "security" | "login" | "unknown" | "expired" | "forbidden" | "suppressed" | "processing" | "not-supported" | "duplicate" | "multiple-matches" | "not-found" | "deleted" | "too-long" | "code-invalid" | "extension" | "too-costly" | "business-rule" | "conflict" | "transient" | "lock-error" | "no-store" | "exception" | "timeout" | "incomplete" | "throttled" | "informational";
  details?: FHIRIssueDetails;
  diagnostics?: string;
}

export interface OperationOutcome {
  resourceType: "OperationOutcome";
  id: string;
  issue: FHIRIssue[];
}

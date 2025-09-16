import { Patient, PatientBundle } from '../fhir/patient';
import { Slot, SlotBundle } from '../fhir/slot';
import { Appointment, AppointmentBundle } from '../fhir/appointment';
import { Encounter, EncounterBundle } from '../fhir/encounter';
import { Condition, ConditionBundle } from '../fhir/condition';
import { Coverage, CoverageBundle } from '../fhir/coverage';
import { Account, AccountBundle } from '../fhir/account';
import { OperationOutcome } from '../fhir/operationOutcome';

export interface SuccessResponse {
  success: boolean;
  message: string;
}

export interface APIErrorResponse {
  error: string;
  details?: any;
}

export type PatientSearchResponse = PatientBundle;
export type PatientGetResponse = Patient;
export interface PatientUpdateResponse extends SuccessResponse {}

export type SlotSearchResponse = SlotBundle;

export type AppointmentSearchResponse = AppointmentBundle;
export type AppointmentGetResponse = Appointment;
export interface AppointmentCreateResponse extends SuccessResponse {}
export interface AppointmentUpdateResponse extends SuccessResponse {}

export type EncounterSearchResponse = EncounterBundle;
export type EncounterGetResponse = Encounter;

export type ConditionSearchResponse = ConditionBundle;
export type ConditionGetResponse = Condition;
export interface ConditionCreateResponse extends SuccessResponse {}

export type CoverageSearchResponse = CoverageBundle;
export type CoverageGetResponse = Coverage;

export type AccountSearchResponse = AccountBundle;
export type AccountGetResponse = Account;

export type CompositionCreateResponse = OperationOutcome;

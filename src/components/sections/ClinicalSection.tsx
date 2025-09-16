'use client';

import { useState } from 'react';
import { useCompositions, useCreateComposition } from '@/hooks/useCompositions';
import { useMedications, useCreateMedication } from '@/hooks/useMedications';
import { useConditions, useCreateCondition } from '@/hooks/useConditions';
import { useEncounters } from '@/hooks/useEncounters';
import { useDiagnosticReports } from '@/hooks/useDiagnosticReports';
import { usePatients } from '@/hooks/usePatients';
import { usePractitioners, getPractitionerName } from '@/hooks/usePractitioners';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function ClinicalSection() {
  const [activeTab, setActiveTab] = useState('notes');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  
  // Clinical Notes State
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    practitionerId: '',
    noteType: '11488-4' // Consult note
  });

  // Medication State
  const [isCreatingMedication, setIsCreatingMedication] = useState(false);
  const [newMedication, setNewMedication] = useState({
    medicationCode: '',
    medicationDisplay: '',
    dosageText: '',
    startDate: ''
  });

  // Diagnosis State
  const [isCreatingDiagnosis, setIsCreatingDiagnosis] = useState(false);
  const [newDiagnosis, setNewDiagnosis] = useState({
    conditionCode: '',
    conditionDisplay: '',
    onsetDate: ''
  });

  // Data fetching
  const { data: patients } = usePatients({});
  const { data: practitioners } = usePractitioners();
  const { data: compositions } = useCompositions(selectedPatientId ? { patient: selectedPatientId } : undefined);
  const { data: medications } = useMedications(selectedPatientId ? { patient: selectedPatientId } : undefined);
  const { data: conditions } = useConditions(selectedPatientId ? { patient: selectedPatientId } : undefined);
  const { data: encounters } = useEncounters(selectedPatientId ? { patient: selectedPatientId } : undefined);
  const { data: diagnosticReports } = useDiagnosticReports(selectedPatientId ? { patient: selectedPatientId } : undefined);

  // Mutations
  const createComposition = useCreateComposition();
  const createMedication = useCreateMedication();
  const createCondition = useCreateCondition();

  const handleCreateNote = async () => {
    if (!selectedPatientId || !newNote.title || !newNote.content || !newNote.practitionerId) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const codeDisplayMap: Record<string, string> = {
        '11488-4': 'Consult note',
        '18842-5': 'Discharge Summary',
        '28570-0': 'Procedure Note'
      };

      const compositionData = {
        resourceType: "Composition",
        status: "preliminary",
        type: {
          coding: [{
            system: "http://loinc.org",
            code: newNote.noteType || '11488-4',
            display: codeDisplayMap[newNote.noteType] || 'Consult note'
          }]
        },
        category: [{
          coding: [{
            system: 'http://loinc.org',
            code: 'LP173421-1',
            display: 'Report'
          }]
        }],
        subject: { reference: `Patient/${selectedPatientId}` },
        author: [{ reference: `Practitioner/${newNote.practitionerId}` }],
        title: newNote.title,
        date: new Date().toISOString(),
        section: [{
          title: 'Clinical Note',
          code: {
            coding: [{
              system: 'http://loinc.org',
              code: '18776-5',
              display: 'Plan of treatment (narrative)'
            }]
          },
          text: {
            status: 'generated',
            div: `<div xmlns="http://www.w3.org/1999/xhtml">${newNote.content}</div>`
          }
        }]
      };

      await createComposition.mutateAsync(compositionData);
      setIsCreatingNote(false);
      setNewNote({ title: '', content: '', practitionerId: '', noteType: '11488-4' });
      alert('Clinical note created successfully!');
    } catch (error) {
      console.error('Failed to create note:', error);
      alert('Failed to create clinical note');
    }
  };

  const handleCreateMedication = async () => {
    if (!selectedPatientId || !newMedication.medicationCode || !newMedication.medicationDisplay || !newMedication.dosageText) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const medicationData = {
        resourceType: 'MedicationStatement',
        status: 'active',
        medicationCodeableConcept: {
          coding: [{
            system: 'RxNorm',
            code: newMedication.medicationCode,
            display: newMedication.medicationDisplay
          }],
          text: newMedication.medicationDisplay
        },
        subject: { reference: `Patient/${selectedPatientId}` },
        effectivePeriod: {
          start: newMedication.startDate ? `${newMedication.startDate}T10:00:00Z` : new Date().toISOString()
        },
        dosage: [{
          text: newMedication.dosageText
        }]
      };

      await createMedication.mutateAsync(medicationData);
      setIsCreatingMedication(false);
      setNewMedication({ medicationCode: '', medicationDisplay: '', dosageText: '', startDate: '' });
      alert('Medication added successfully!');
    } catch (error) {
      console.error('Failed to create medication:', error);
      alert('Failed to add medication');
    }
  };

  const handleCreateDiagnosis = async () => {
    if (!selectedPatientId || !newDiagnosis.conditionCode || !newDiagnosis.conditionDisplay) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const diagnosisData = {
        resourceType: 'Condition',
        clinicalStatus: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'active',
            display: 'Active'
          }]
        },
        code: {
          coding: [{
            system: 'ICD10',
            code: newDiagnosis.conditionCode,
            display: newDiagnosis.conditionDisplay
          }],
          text: newDiagnosis.conditionDisplay
        },
        subject: { reference: `Patient/${selectedPatientId}` },
        onsetDateTime: newDiagnosis.onsetDate ? `${newDiagnosis.onsetDate}T10:00:00Z` : new Date().toISOString()
      };

      await createCondition.mutateAsync(diagnosisData);
      setIsCreatingDiagnosis(false);
      setNewDiagnosis({ conditionCode: '', conditionDisplay: '', onsetDate: '' });
      alert('Diagnosis added successfully!');
    } catch (error) {
      console.error('Failed to create diagnosis:', error);
      alert('Failed to add diagnosis');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const commonMedications = [
    { code: '314076', display: 'Lisinopril 10 MG Oral Tablet' },
    { code: '197361', display: 'Metformin 500 MG Oral Tablet' },
    { code: '617312', display: 'Atorvastatin 20 MG Oral Tablet' },
    { code: '308136', display: 'Amlodipine 5 MG Oral Tablet' },
    { code: '198211', display: 'Omeprazole 20 MG Delayed Release Oral Capsule' }
  ];

  const commonDiagnoses = [
    { code: 'I10', display: 'Essential (primary) hypertension' },
    { code: 'E11.9', display: 'Type 2 diabetes mellitus without complications' },
    { code: 'E78.5', display: 'Hyperlipidemia, unspecified' },
    { code: 'J44.1', display: 'Chronic obstructive pulmonary disease with acute exacerbation' },
    { code: 'M79.3', display: 'Panniculitis, unspecified' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Clinical Operations</h2>
      </div>

      {/* Patient Selection */}
      <Card title="Select Patient">
        <div className="text-black">
          <label className="block text-sm font-medium mb-1">Patient *</label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Patient</option>
            {patients?.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name?.[0] ? `${patient.name[0].given?.join(' ') || ''} ${patient.name[0].family || ''}`.trim() || `Patient ${patient.id}` : `Patient ${patient.id}`}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {selectedPatientId && (
        <>
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'notes', label: 'Clinical Notes' },
                { id: 'medications', label: 'Medications' },
                { id: 'diagnoses', label: 'Diagnoses' },
                { id: 'labs', label: 'Lab Results' },
                { id: 'encounters', label: 'Encounters' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Clinical Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-black">Clinical Notes</h3>
                <Button onClick={() => setIsCreatingNote(true)}>
                  Add Clinical Note
                </Button>
              </div>

              {isCreatingNote && (
                <Card title="Add Clinical Note">
                  <div className="space-y-4 text-black">
                    <Input
                      label="Note Title *"
                      value={newNote.title}
                      onChange={(value) => setNewNote(prev => ({ ...prev, title: value }))}
                      placeholder="e.g., Follow-up regarding recent lab results"
                    />

                    <div>
                      <label className="block text-sm font-medium mb-1">Practitioner *</label>
                      <select
                        value={newNote.practitionerId}
                        onChange={(e) => setNewNote(prev => ({ ...prev, practitionerId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select Practitioner</option>
                        {practitioners?.map((practitioner) => (
                          <option key={practitioner.id} value={practitioner.id}>
                            {getPractitionerName(practitioner)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Note Type</label>
                      <select
                        value={newNote.noteType}
                        onChange={(e) => setNewNote(prev => ({ ...prev, noteType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="11488-4">Consult Note</option>
                        <option value="18842-5">Discharge Summary</option>
                        <option value="28570-0">Procedure Note</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Clinical Content *</label>
                      <textarea
                        value={newNote.content}
                        onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={6}
                        placeholder="Enter clinical notes, observations, treatment plans, etc."
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleCreateNote} disabled={createComposition.isPending}>
                        {createComposition.isPending ? 'Creating...' : 'Create Note'}
                      </Button>
                      <Button variant="secondary" onClick={() => setIsCreatingNote(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              <div className="space-y-3">
                {compositions?.map((note) => (
                  <Card key={note.id}>
                    <div className="text-black">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-lg">{note.title}</h4>
                        <span className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-800">
                          {note.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Type: {note.type?.coding?.[0]?.display}
                      </p>
                      {note.date && (
                        <p className="text-sm text-gray-600 mb-2">
                          Date: {formatDate(note.date)}
                        </p>
                      )}
                      {note.author?.[0] && (
                        <p className="text-sm text-gray-600 mb-2">
                          Author: {note.author[0].display || note.author[0].reference}
                        </p>
                      )}
                      {note.section?.[0]?.text?.div && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <div dangerouslySetInnerHTML={{ __html: note.section[0].text.div }} />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
                {compositions?.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    No clinical notes found for this patient.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Medications Tab */}
          {activeTab === 'medications' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-black">Medications</h3>
                <Button onClick={() => setIsCreatingMedication(true)}>
                  Add Medication
                </Button>
              </div>

              {isCreatingMedication && (
                <Card title="Add Medication">
                  <div className="space-y-4 text-black">
                    <div>
                      <label className="block text-sm font-medium mb-1">Medication *</label>
                      <select
                        value={newMedication.medicationCode}
                        onChange={(e) => {
                          const selected = commonMedications.find(med => med.code === e.target.value);
                          setNewMedication(prev => ({
                            ...prev,
                            medicationCode: e.target.value,
                            medicationDisplay: selected?.display || ''
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select Medication</option>
                        {commonMedications.map((med) => (
                          <option key={med.code} value={med.code}>
                            {med.display}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="Dosage Instructions *"
                      value={newMedication.dosageText}
                      onChange={(value) => setNewMedication(prev => ({ ...prev, dosageText: value }))}
                      placeholder="e.g., Take one tablet by mouth once daily"
                    />

                    <Input
                      label="Start Date"
                      type="date"
                      value={newMedication.startDate}
                      onChange={(value) => setNewMedication(prev => ({ ...prev, startDate: value }))}
                    />

                    <div className="flex gap-2">
                      <Button onClick={handleCreateMedication} disabled={createMedication.isPending}>
                        {createMedication.isPending ? 'Adding...' : 'Add Medication'}
                      </Button>
                      <Button variant="secondary" onClick={() => setIsCreatingMedication(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              <div className="space-y-3">
                {medications?.map((medication) => (
                  <Card key={medication.id}>
                    <div className="text-black">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-lg">
                          {medication.medicationCodeableConcept?.text}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          medication.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {medication.status}
                        </span>
                      </div>
                      {medication.medicationCodeableConcept?.coding?.[0] && (
                        <p className="text-sm text-gray-600 mb-2">
                          Code: {medication.medicationCodeableConcept.coding[0].code} ({medication.medicationCodeableConcept.coding[0].system})
                        </p>
                      )}
                      {medication.dosage?.[0]?.text && (
                        <p className="text-sm text-gray-800 mb-2">
                          <strong>Dosage:</strong> {medication.dosage[0].text}
                        </p>
                      )}
                      {medication.effectivePeriod?.start && (
                        <p className="text-sm text-gray-600">
                          Started: {formatDate(medication.effectivePeriod.start)}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
                {medications?.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    No medications found for this patient.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Diagnoses Tab */}
          {activeTab === 'diagnoses' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-black">Diagnoses & Conditions</h3>
                <Button onClick={() => setIsCreatingDiagnosis(true)}>
                  Add Diagnosis
                </Button>
              </div>

              {isCreatingDiagnosis && (
                <Card title="Add Diagnosis">
                  <div className="space-y-4 text-black">
                    <div>
                      <label className="block text-sm font-medium mb-1">Diagnosis *</label>
                      <select
                        value={newDiagnosis.conditionCode}
                        onChange={(e) => {
                          const selected = commonDiagnoses.find(diag => diag.code === e.target.value);
                          setNewDiagnosis(prev => ({
                            ...prev,
                            conditionCode: e.target.value,
                            conditionDisplay: selected?.display || ''
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select Diagnosis</option>
                        {commonDiagnoses.map((diag) => (
                          <option key={diag.code} value={diag.code}>
                            {diag.code} - {diag.display}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="Onset Date"
                      type="date"
                      value={newDiagnosis.onsetDate}
                      onChange={(value) => setNewDiagnosis(prev => ({ ...prev, onsetDate: value }))}
                    />

                    <div className="flex gap-2">
                      <Button onClick={handleCreateDiagnosis} disabled={createCondition.isPending}>
                        {createCondition.isPending ? 'Adding...' : 'Add Diagnosis'}
                      </Button>
                      <Button variant="secondary" onClick={() => setIsCreatingDiagnosis(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              <div className="space-y-3">
                {conditions?.map((condition) => (
                  <Card key={condition.id}>
                    <div className="text-black">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-lg">
                          {condition.code?.text}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          condition.clinicalStatus?.coding?.[0]?.code === 'active'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {condition.clinicalStatus?.coding?.[0]?.display}
                        </span>
                      </div>
                      {condition.code?.coding?.[0] && (
                        <p className="text-sm text-gray-600 mb-2">
                          Code: {condition.code.coding[0].code} ({condition.code.coding[0].system})
                        </p>
                      )}
                      {condition.onsetDateTime && (
                        <p className="text-sm text-gray-600">
                          Onset: {formatDate(condition.onsetDateTime)}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
                {conditions?.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    No diagnoses found for this patient.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Lab Results Tab */}
          {activeTab === 'labs' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">Lab Results & Diagnostic Reports</h3>
              
              <div className="space-y-3">
                {diagnosticReports?.map((report: any) => (
                  <Card key={report.id}>
                    <div className="text-black">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-lg">
                          {report.code?.text || report.code?.coding?.[0]?.display || 'Diagnostic Report'}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          report.status === 'final'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      {report.effectiveDateTime && (
                        <p className="text-sm text-gray-600 mb-2">
                          Date: {formatDate(report.effectiveDateTime)}
                        </p>
                      )}
                      {report.code?.coding?.[0] && (
                        <p className="text-sm text-gray-600 mb-2">
                          Code: {report.code.coding[0].code} ({report.code.coding[0].system})
                        </p>
                      )}
                      {report.conclusion && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <p className="text-sm"><strong>Conclusion:</strong> {report.conclusion}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
                {diagnosticReports?.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    No lab results found for this patient.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Encounters Tab */}
          {activeTab === 'encounters' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-black">Patient Encounters & History</h3>
              
              <div className="space-y-3">
                {encounters?.map((encounter) => (
                  <Card key={encounter.id}>
                    <div className="text-black">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-lg">
                          {encounter.class?.display || 'Encounter'}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          encounter.status === 'finished'
                            ? 'bg-green-100 text-green-800'
                            : encounter.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {encounter.status}
                        </span>
                      </div>
                      {encounter.period?.start && (
                        <p className="text-sm text-gray-600 mb-2">
                          Start: {formatDate(encounter.period.start)}
                        </p>
                      )}
                      {encounter.period?.end && (
                        <p className="text-sm text-gray-600 mb-2">
                          End: {formatDate(encounter.period.end)}
                        </p>
                      )}
                      {encounter.type?.[0]?.coding?.[0]?.display && (
                        <p className="text-sm text-gray-600 mb-2">
                          Type: {encounter.type[0].coding[0].display}
                        </p>
                      )}
                      {encounter.reasonCode?.[0]?.text && (
                        <p className="text-sm text-gray-800">
                          <strong>Reason:</strong> {encounter.reasonCode[0].text}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
                {encounters?.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    No encounters found for this patient.
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

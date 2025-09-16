'use client';

import { useState } from 'react';
import { useAllergies, useCreateAllergy, useUpdateAllergy } from '@/hooks/useAllergies';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

interface AllergyManagementProps {
  patientId: string;
}

interface AllergyFormData {
  substance: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
  status: 'active' | 'inactive' | 'resolved';
}

const getReactionCode = (reaction: string): string => {
  const reactionCodes: Record<string, string> = {
    'Anaphylaxis': '417516000',
    'Angioedema': '41291007',
    'Diarrhea': '62315008',
    'Dizziness': '404640003',
    'Fatigue': '84229001',
    'GI upset': '162059005',
    'Hives': '126485001',
    'Liver toxicity': '197354009',
    'Nausea': '422587007',
    'Rash': '162415008',
    'Shortness of breath': '267036007',
    'Swelling': '65124004',
    'Weal': '247472004',
    'Other': '419199007'
  };
  return reactionCodes[reaction] || '419199007'; // Default to "Other"
};

const getSubstanceCode = (substance: string): string => {
  const substanceCodes: Record<string, string> = {
    'Codeine': '2670',
    'Penicillin': '7980',
    'Amoxicillin': '723',
    'Ibuprofen': '5640',
    'Aspirin': '1191'
  };
  return substanceCodes[substance] || '2670';
};

export default function AllergyManagement({ patientId }: AllergyManagementProps) {
  const { data: allergies, isLoading: allergiesLoading, error: allergiesError } = useAllergies({ patient: patientId });
  const createAllergyMutation = useCreateAllergy();
  const updateAllergyMutation = useUpdateAllergy();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState<string | null>(null);
  const [formData, setFormData] = useState<AllergyFormData>({
    substance: '',
    reaction: '',
    severity: 'mild',
    status: 'active'
  });

  const resetForm = () => {
    setFormData({
      substance: '',
      reaction: '',
      severity: 'mild',
      status: 'active'
    });
    setShowAddForm(false);
    setEditingAllergy(null);
  };

  const handleAddAllergy = async () => {
    if (!formData.substance || !formData.reaction) return;

    try {
      const allergyData = {
        resourceType: "AllergyIntolerance",
        clinicalStatus: {
          coding: [{
            system: "https://www.hl7.org/fhir/valueset-allergyintolerance-clinical.html",
            code: formData.status,
            display: formData.status === 'active' ? 'Active' : formData.status === 'inactive' ? 'Inactive' : 'Resolved'
          }],
          text: formData.status === 'active' ? 'Active' : formData.status === 'inactive' ? 'Inactive' : 'Resolved'
        },
        code: {
          coding: [{
            system: "RxNorm",
            code: getSubstanceCode(formData.substance),
            display: formData.substance
          }],
          text: formData.substance
        },
        patient: {
          reference: `Patient/${patientId}`
        },
        onsetDateTime: new Date().toISOString(),
        recordedDate: new Date().toISOString(),
        reaction: [{
          substance: {
            coding: [{
              system: "RxNorm",
              code: getSubstanceCode(formData.substance),
              display: formData.substance
            }],
            text: formData.substance
          },
          manifestation: [{
            coding: [{
              system: "SNOMED CT",
              code: getReactionCode(formData.reaction),
              display: formData.reaction
            }],
            text: formData.reaction
          }],
          description: `Patient experiences ${formData.reaction} with ${formData.substance}`
        }]
      };

      await createAllergyMutation.mutateAsync(allergyData);
      resetForm();
    } catch (error) {
      console.error('Failed to add allergy:', error);
    }
  };

  const handleUpdateAllergy = async (allergyId: string) => {
    if (!formData.substance || !formData.reaction) return;

    try {
      const updateData = {
        id: allergyId,
        resourceType: "AllergyIntolerance",
        clinicalStatus: {
          coding: [{
            system: "https://www.hl7.org/fhir/valueset-allergyintolerance-clinical.html",
            code: formData.status,
            display: formData.status === 'active' ? 'Active' : formData.status === 'inactive' ? 'Inactive' : 'Resolved'
          }],
          text: formData.status === 'active' ? 'Active' : formData.status === 'inactive' ? 'Inactive' : 'Resolved'
        },
        reaction: [{
          manifestation: [{
            coding: [{
              system: "SNOMED CT",
              code: getReactionCode(formData.reaction),
              display: formData.reaction
            }],
            text: formData.reaction
          }],
          description: `Patient experiences ${formData.reaction}`
        }]
      };

      await updateAllergyMutation.mutateAsync({
        allergyId: allergyId,
        data: updateData
      });
      resetForm();
    } catch (error) {
      console.error('Failed to update allergy:', error);
    }
  };

  const startEdit = (allergy: any) => {
    const reaction = allergy.reaction?.[0];
    setFormData({
      substance: allergy.code?.text || '',
      reaction: reaction?.manifestation?.[0]?.text || '',
      severity: reaction?.severity || 'mild',
      status: allergy.clinicalStatus?.coding?.[0]?.code || 'active'
    });
    setEditingAllergy(allergy.id);
    setShowAddForm(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'destructive';
      case 'moderate': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'destructive' : 'secondary';
  };

  if (allergiesLoading) {
    return (
      <Card title="⚠️ Allergies & Adverse Reactions">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading allergies...</div>
        </div>
      </Card>
    );
  }

  if (allergiesError) {
    return (
      <Card title="⚠️ Allergies & Adverse Reactions">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">Error loading allergies: {allergiesError.message}</p>
        </div>
      </Card>
    );
  }

  const allergyList = Array.isArray(allergies) ? allergies : (allergies as any)?.entry || [];

  return (
    <Card title="⚠️ Allergies & Adverse Reactions">
      <div className="space-y-4">
        {allergyList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">No known allergies recorded</p>
            <Button variant="primary" onClick={() => setShowAddForm(true)}>
              ➕ Add First Allergy
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {allergyList.map((entry: any) => {
                const allergy = entry.resource;
                const reaction = allergy.reaction?.[0];
                const status = allergy.clinicalStatus?.coding?.[0]?.code || 'active';
                
                return (
                  <div key={allergy.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{allergy.code?.text}</h4>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={getStatusColor(status)}>
                            {status === 'active' ? '🔴 Active' : '⚪ Inactive'}
                          </Badge>
                          {reaction?.severity && (
                            <Badge variant={getSeverityColor(reaction.severity)}>
                              {reaction.severity}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="secondary" 
                        onClick={() => startEdit(allergy)}
                        className="text-sm"
                      >
                        ✏️ Edit
                      </Button>
                    </div>
                    
                    {reaction && (
                      <div className="mt-3 text-sm text-gray-600">
                        <p><strong>Reaction:</strong> {reaction.manifestation?.[0]?.text}</p>
                        {reaction.description && (
                          <p><strong>Description:</strong> {reaction.description}</p>
                        )}
                        {allergy.recordedDate && (
                          <p><strong>Recorded:</strong> {new Date(allergy.recordedDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!showAddForm && (
              <div className="pt-4 border-t">
                <Button variant="primary" onClick={() => setShowAddForm(true)}>
                  ➕ Add New Allergy
                </Button>
              </div>
            )}
          </>
        )}

        {showAddForm && (
          <div className="mt-6 p-4 border border-blue-200 rounded-lg bg-blue-50 text-black">
            <h4 className="font-semibold mb-4">
              {editingAllergy ? '✏️ Edit Allergy' : '➕ Add New Allergy'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allergen/Substance *
                </label>
                <select
                  value={formData.substance}
                  onChange={(e) => setFormData({ ...formData, substance: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a substance...</option>
                  <option value="Codeine">Codeine</option>
                  <option value="Penicillin">Penicillin</option>
                  <option value="Amoxicillin">Amoxicillin</option>
                  <option value="Ibuprofen">Ibuprofen</option>
                  <option value="Aspirin">Aspirin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reaction *</label>
                <select
                  value={formData.reaction}
                  onChange={(e) => setFormData({ ...formData, reaction: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a reaction...</option>
                  <option value="Anaphylaxis">Anaphylaxis</option>
                  <option value="Angioedema">Angioedema</option>
                  <option value="Diarrhea">Diarrhea</option>
                  <option value="Dizziness">Dizziness</option>
                  <option value="Fatigue">Fatigue</option>
                  <option value="GI upset">GI upset</option>
                  <option value="Hives">Hives</option>
                  <option value="Liver toxicity">Liver toxicity</option>
                  <option value="Nausea">Nausea</option>
                  <option value="Rash">Rash</option>
                  <option value="Shortness of breath">Shortness of breath</option>
                  <option value="Swelling">Swelling</option>
                  <option value="Weal">Weal</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as 'mild' | 'moderate' | 'severe' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'resolved' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="primary" 
                onClick={editingAllergy ? () => handleUpdateAllergy(editingAllergy) : handleAddAllergy}
                disabled={!formData.substance || !formData.reaction || createAllergyMutation.isPending || updateAllergyMutation.isPending}
              >
                {createAllergyMutation.isPending || updateAllergyMutation.isPending ? (
                  editingAllergy ? '💾 Updating...' : '💾 Adding...'
                ) : (
                  editingAllergy ? '💾 Update Allergy' : '💾 Add Allergy'
                )}
              </Button>
              
              <Button variant="secondary" onClick={resetForm}>
                ❌ Cancel
              </Button>
            </div>

            {(createAllergyMutation.error || updateAllergyMutation.error) && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">
                  Error: {createAllergyMutation.error?.message || updateAllergyMutation.error?.message}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * Bouwsubsidie Wizard Constants
 * 
 * Predefined options and document requirements
 * 
 * UPDATED: V1.3 Phase 5A - Document Upload Implementation
 * - Changed REQUIRED_DOCUMENTS to include document_code and is_mandatory
 * - Updated INITIAL_FORM_DATA.documents structure for file upload
 */

import type { DocumentUpload } from './types'

export const APPLICATION_REASONS = [
  { value: 'new_construction', labelKey: 'bouwsubsidie.reasons.new_construction' },
  { value: 'renovation', labelKey: 'bouwsubsidie.reasons.renovation' },
  { value: 'extension', labelKey: 'bouwsubsidie.reasons.extension' },
  { value: 'repair', labelKey: 'bouwsubsidie.reasons.repair' },
  { value: 'disaster_recovery', labelKey: 'bouwsubsidie.reasons.disaster_recovery' },
] as const

export const GENDER_OPTIONS = [
  { value: 'male', labelKey: 'bouwsubsidie.gender.male' },
  { value: 'female', labelKey: 'bouwsubsidie.gender.female' },
  { value: 'other', labelKey: 'bouwsubsidie.gender.other' },
] as const

/**
 * Document requirements for Bouwsubsidie
 * Aligned with subsidy_document_requirement table
 * 
 * V1.3 Phase 5A: Updated with is_mandatory flag
 */
export const REQUIRED_DOCUMENTS: Omit<DocumentUpload, 'uploaded_file'>[] = [
  // 5 mandatory documents
  { id: 'ID_COPY', document_code: 'ID_COPY', label: 'bouwsubsidie.documents.ID_COPY', is_mandatory: true },
  { id: 'INCOME_PROOF', document_code: 'INCOME_PROOF', label: 'bouwsubsidie.documents.INCOME_PROOF', is_mandatory: true },
  { id: 'LAND_TITLE', document_code: 'LAND_TITLE', label: 'bouwsubsidie.documents.LAND_TITLE', is_mandatory: true },
  { id: 'BANK_STATEMENT', document_code: 'BANK_STATEMENT', label: 'bouwsubsidie.documents.BANK_STATEMENT', is_mandatory: true },
  { id: 'HOUSEHOLD_COMP', document_code: 'HOUSEHOLD_COMP', label: 'bouwsubsidie.documents.HOUSEHOLD_COMP', is_mandatory: true },
  // 2 optional documents
  { id: 'CBB_EXTRACT', document_code: 'CBB_EXTRACT', label: 'bouwsubsidie.documents.CBB_EXTRACT', is_mandatory: false },
  { id: 'FAMILY_EXTRACT', document_code: 'FAMILY_EXTRACT', label: 'bouwsubsidie.documents.FAMILY_EXTRACT', is_mandatory: false },
]

export const WIZARD_STEPS = [
  { titleKey: 'wizard.steps.introduction' },
  { titleKey: 'wizard.steps.personalInfo' },
  { titleKey: 'wizard.steps.contact' },
  { titleKey: 'wizard.steps.household' },
  { titleKey: 'wizard.steps.address' },
  { titleKey: 'wizard.steps.application' },
  { titleKey: 'wizard.steps.documents' },
  { titleKey: 'wizard.steps.review' },
  { titleKey: 'wizard.steps.receipt' },
] as const

/**
 * Initial form data with empty document upload slots
 */
export const INITIAL_FORM_DATA = {
  // Step 1 - Personal (aligned with Edge Function contract)
  national_id: '',
  first_name: '',
  last_name: '',
  date_of_birth: '',
  gender: '',
  
  // Step 2 - Contact
  phone_number: '',
  email: '',
  
  // Step 3 - Household
  household_size: 1,
  dependents: 0,
  
  // Step 4 - Address (aligned with Edge Function contract)
  address_line_1: '',
  district: '',
  ressort: '',
  
  // Step 5 - Context
  application_reason: '',
  estimated_amount: '',
  is_calamity: false,
  
  // Step 6 - Documents (V1.3 Phase 5A: File upload structure)
  documents: REQUIRED_DOCUMENTS.map(doc => ({
    id: doc.id,
    document_code: doc.document_code,
    label: doc.label,
    is_mandatory: doc.is_mandatory,
    // uploaded_file is undefined until file is uploaded
  })),
  
  // Step 7 - Review
  declaration_accepted: false,
}

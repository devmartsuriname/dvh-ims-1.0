/**
 * Bouwsubsidie Wizard Constants
 * 
 * Predefined options and document requirements
 */

export const APPLICATION_REASONS = [
  { value: 'new_construction', label: 'New construction' },
  { value: 'renovation', label: 'Home renovation' },
  { value: 'extension', label: 'Home extension' },
  { value: 'repair', label: 'Structural repairs' },
  { value: 'disaster_recovery', label: 'Disaster recovery' },
] as const

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
] as const

export const REQUIRED_DOCUMENTS = [
  { id: 'national_id', label: 'Copy of National ID (front and back)' },
  { id: 'income_proof', label: 'Proof of income (recent pay slips or tax declaration)' },
  { id: 'property_proof', label: 'Property ownership documents or land lease' },
  { id: 'construction_plan', label: 'Construction plan or cost estimate' },
  { id: 'bank_statement', label: 'Recent bank statement' },
] as const

export const WIZARD_STEPS = [
  { title: 'Introduction' },
  { title: 'Personal Info' },
  { title: 'Contact' },
  { title: 'Household' },
  { title: 'Address' },
  { title: 'Application' },
  { title: 'Documents' },
  { title: 'Review' },
  { title: 'Receipt' },
] as const

export const INITIAL_FORM_DATA = {
  // Step 1 - Personal
  national_id: '',
  full_name: '',
  date_of_birth: '',
  gender: '',
  
  // Step 2 - Contact
  phone_number: '',
  email: '',
  
  // Step 3 - Household
  household_size: 1,
  dependents: 0,
  
  // Step 4 - Address
  address_line: '',
  district: '',
  ressort: '',
  
  // Step 5 - Context
  application_reason: '',
  estimated_amount: '',
  is_calamity: false,
  
  // Step 6 - Documents
  documents: REQUIRED_DOCUMENTS.map(doc => ({
    id: doc.id,
    label: doc.label,
    hasDocument: false,
  })),
  
  // Step 7 - Review
  declaration_accepted: false,
}

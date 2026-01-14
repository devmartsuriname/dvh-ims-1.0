/**
 * Bouwsubsidie Wizard Form Types
 * 
 * TypeScript interfaces for the Construction Subsidy application wizard
 */

export interface DocumentDeclaration {
  id: string
  label: string
  hasDocument: boolean
}

export interface BouwsubsidieFormData {
  // Step 1 - Personal Identification
  national_id: string
  full_name: string
  date_of_birth: string
  gender: string
  
  // Step 2 - Contact Information
  phone_number: string
  email: string
  
  // Step 3 - Household Information
  household_size: number
  dependents: number
  
  // Step 4 - Current Address
  address_line: string
  district: string
  ressort: string
  
  // Step 5 - Application Context
  application_reason: string
  estimated_amount: string
  is_calamity: boolean
  
  // Step 6 - Document Declaration
  documents: DocumentDeclaration[]
  
  // Step 7 - Review
  declaration_accepted: boolean
}

export interface WizardStepProps {
  formData: BouwsubsidieFormData
  updateFormData: (data: Partial<BouwsubsidieFormData>) => void
  onNext: () => void
  onBack: () => void
}

export interface SubmissionResult {
  reference_number: string
  access_token: string
  submitted_at: string
}

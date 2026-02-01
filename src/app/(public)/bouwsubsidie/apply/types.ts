/**
 * Bouwsubsidie Wizard Form Types
 * 
 * TypeScript interfaces for the Construction Subsidy application wizard
 * 
 * UPDATED: V1.3 Phase 5A - Document Upload Implementation
 * - Changed documents from declaration toggle to file upload
 * - Added uploaded_file structure for storage references
 */

/**
 * Document upload record for a single document requirement
 */
export interface DocumentUpload {
  id: string                    // requirement ID (e.g., 'ID_COPY')
  document_code: string         // code matching subsidy_document_requirement
  label: string                 // display label (translated)
  is_mandatory: boolean         // whether upload is required
  uploaded_file?: {
    file_path: string           // storage path in citizen-uploads bucket
    file_name: string           // original file name
    file_size: number           // file size in bytes
    uploaded_at: string         // ISO timestamp
  }
}

/**
 * Main form data structure for Bouwsubsidie wizard
 */
export interface BouwsubsidieFormData {
  // Step 1 - Personal Identification
  national_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: string
  
  // Step 2 - Contact Information
  phone_number: string
  email: string
  
  // Step 3 - Household Information
  household_size: number
  dependents: number
  
  // Step 4 - Current Address
  address_line_1: string
  district: string
  ressort: string
  
  // Step 5 - Application Context
  application_reason: string
  estimated_amount: string
  is_calamity: boolean
  
  // Step 6 - Document Uploads (V1.3 Phase 5A)
  documents: DocumentUpload[]
  
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

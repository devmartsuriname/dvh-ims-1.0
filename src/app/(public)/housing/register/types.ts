/**
 * Housing Registration Wizard Form Types
 * 
 * TypeScript interfaces for the Housing Registration wizard
 * 
 * UPDATED: Admin v1.1-D - Aligned with Edge Function contract
 * - Changed full_name → first_name + last_name
 * - Added gender field (required)
 * - Made date_of_birth, email required
 * - Changed current_address → address_line_1
 * - Changed current_district → district
 */

export interface HousingFormData {
  // Step 1 - Personal Identification
  national_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: string

  // Step 2 - Contact Information
  phone_number: string
  email: string

  // Step 3 - Current Living Situation
  address_line_1: string
  district: string
  current_housing_type: string
  monthly_rent: string
  number_of_residents: number

  // Step 4 - Housing Preference
  interest_type: string  // rent | rent_to_own | purchase
  preferred_district: string

  // Step 5 - Reason for Application
  application_reason: string

  // Step 6 - Income Information
  income_source: string
  monthly_income_applicant: string
  monthly_income_partner: string

  // Step 7 - Special Needs / Urgency
  has_disability: boolean
  has_emergency: boolean
  urgency_details: string

  // Step 8 - Review
  declaration_accepted: boolean
}

export interface WizardStepProps {
  formData: HousingFormData
  updateFormData: (data: Partial<HousingFormData>) => void
  onNext: () => void
  onBack: () => void
}

export interface SubmissionResult {
  reference_number: string
  access_token: string
  submitted_at: string
}

/**
 * Bouwsubsidie Validation Schemas
 * Phase 9B-2: IMS Logic Adapter (NO DB)
 * 
 * EXACT COPY of schemas from IMS step components
 * Do not modify - use as-is for adapter validation
 * 
 * Restore Point: PHASE-9B-2-BEFORE-ADAPTER
 */

import * as yup from 'yup'

/**
 * Step 1: Personal Identification
 * Source: src/app/(public)/bouwsubsidie/apply/steps/Step1PersonalInfo.tsx
 */
export const step1PersonalInfoSchema = yup.object({
  national_id: yup
    .string()
    .required('National ID is required')
    .min(5, 'National ID must be at least 5 characters'),
  full_name: yup
    .string()
    .required('Full name is required')
    .min(2, 'Full name must be at least 2 characters'),
  date_of_birth: yup.string(),
  gender: yup.string(),
})

export type BouwsubsidieStep1Data = yup.InferType<typeof step1PersonalInfoSchema>

/**
 * Step 2: Contact Information
 * Source: src/app/(public)/bouwsubsidie/apply/steps/Step2ContactInfo.tsx
 */
export const step2ContactInfoSchema = yup.object({
  phone_number: yup
    .string()
    .required('Phone number is required')
    .min(7, 'Phone number must be at least 7 digits'),
  email: yup
    .string()
    .email('Please enter a valid email address'),
})

export type BouwsubsidieStep2Data = yup.InferType<typeof step2ContactInfoSchema>

/**
 * Step 3: Household Information
 * Source: src/app/(public)/bouwsubsidie/apply/steps/Step3Household.tsx
 */
export const step3HouseholdSchema = yup.object({
  household_size: yup
    .number()
    .required('Household size is required')
    .min(1, 'Household size must be at least 1')
    .max(20, 'Household size cannot exceed 20'),
  dependents: yup
    .number()
    .min(0, 'Dependents cannot be negative')
    .max(20, 'Dependents cannot exceed 20'),
})

export type BouwsubsidieStep3Data = yup.InferType<typeof step3HouseholdSchema>

/**
 * Step 4: Current Address
 * Source: src/app/(public)/bouwsubsidie/apply/steps/Step4Address.tsx
 */
export const step4AddressSchema = yup.object({
  address_line: yup
    .string()
    .required('Address is required')
    .min(5, 'Address must be at least 5 characters'),
  district: yup
    .string()
    .required('District is required'),
  ressort: yup.string(),
})

export type BouwsubsidieStep4Data = yup.InferType<typeof step4AddressSchema>

/**
 * Step 5: Application Context
 * Source: src/app/(public)/bouwsubsidie/apply/steps/Step5Context.tsx
 */
export const step5ContextSchema = yup.object({
  application_reason: yup
    .string()
    .required('Please select a reason for your application'),
  estimated_amount: yup.string(),
  is_calamity: yup.boolean(),
})

export type BouwsubsidieStep5Data = yup.InferType<typeof step5ContextSchema>

/**
 * Step 6: Document Declaration
 * No schema in original - uses array of documents
 */

/**
 * Step 7: Review
 * Declaration checkbox (handled inline)
 */
export const step7ReviewSchema = yup.object({
  declaration_accepted: yup
    .boolean()
    .oneOf([true], 'You must accept the declaration to submit'),
})

export type BouwsubsidieStep7Data = yup.InferType<typeof step7ReviewSchema>

/**
 * Combined form data type
 */
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
  documents: Array<{
    id: string
    label: string
    hasDocument: boolean
  }>
  
  // Step 7 - Review
  declaration_accepted: boolean
}

/**
 * Initial form data for Bouwsubsidie
 */
export const BOUWSUBSIDIE_INITIAL_DATA: BouwsubsidieFormData = {
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
  documents: [
    { id: 'national_id', label: 'Copy of National ID (front and back)', hasDocument: false },
    { id: 'income_proof', label: 'Proof of income (recent pay slips or tax declaration)', hasDocument: false },
    { id: 'property_proof', label: 'Property ownership documents or land lease', hasDocument: false },
    { id: 'construction_plan', label: 'Construction plan or cost estimate', hasDocument: false },
    { id: 'bank_statement', label: 'Recent bank statement', hasDocument: false },
  ],
  
  // Step 7 - Review
  declaration_accepted: false,
}

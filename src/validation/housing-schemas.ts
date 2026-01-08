/**
 * Housing Registration Validation Schemas
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
 * Source: src/app/(public)/housing/register/steps/Step1PersonalInfo.tsx
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
})

export type HousingStep1Data = yup.InferType<typeof step1PersonalInfoSchema>

/**
 * Step 2: Contact Information
 * Source: src/app/(public)/housing/register/steps/Step2ContactInfo.tsx
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

export type HousingStep2Data = yup.InferType<typeof step2ContactInfoSchema>

/**
 * Step 3: Current Living Situation
 * Source: src/app/(public)/housing/register/steps/Step3LivingSituation.tsx
 */
export const step3LivingSituationSchema = yup.object({
  current_address: yup
    .string()
    .required('Current address is required')
    .min(5, 'Address must be at least 5 characters'),
  current_district: yup
    .string()
    .required('District is required'),
  current_housing_type: yup
    .string()
    .required('Housing type is required'),
  monthly_rent: yup.string(),
  number_of_residents: yup
    .number()
    .min(1, 'Must be at least 1')
    .required('Number of residents is required'),
})

export type HousingStep3Data = yup.InferType<typeof step3LivingSituationSchema>

/**
 * Step 4: Housing Preference
 * Source: src/app/(public)/housing/register/steps/Step4HousingPreference.tsx
 */
export const step4HousingPreferenceSchema = yup.object({
  interest_type: yup
    .string()
    .required('Please select your interest type'),
  preferred_district: yup
    .string()
    .required('Please select your preferred district'),
})

export type HousingStep4Data = yup.InferType<typeof step4HousingPreferenceSchema>

/**
 * Step 5: Reason for Application
 * Source: src/app/(public)/housing/register/steps/Step5Reason.tsx
 */
export const step5ReasonSchema = yup.object({
  application_reason: yup
    .string()
    .required('Please select a reason for your application'),
})

export type HousingStep5Data = yup.InferType<typeof step5ReasonSchema>

/**
 * Step 6: Income Information
 * Source: src/app/(public)/housing/register/steps/Step6Income.tsx
 */
export const step6IncomeSchema = yup.object({
  income_source: yup
    .string()
    .required('Please select your income source'),
  monthly_income_applicant: yup.string(),
  monthly_income_partner: yup.string(),
})

export type HousingStep6Data = yup.InferType<typeof step6IncomeSchema>

/**
 * Step 7: Urgency
 * No schema in original - uses local state
 */

/**
 * Step 8: Review
 */
export const step8ReviewSchema = yup.object({
  declaration_accepted: yup
    .boolean()
    .oneOf([true], 'You must accept the declaration to submit'),
})

export type HousingStep8Data = yup.InferType<typeof step8ReviewSchema>

/**
 * Combined form data type
 */
export interface HousingFormData {
  // Step 1 - Personal Identification
  national_id: string
  full_name: string
  date_of_birth: string

  // Step 2 - Contact Information
  phone_number: string
  email: string

  // Step 3 - Current Living Situation
  current_address: string
  current_district: string
  current_housing_type: string
  monthly_rent: string
  number_of_residents: number

  // Step 4 - Housing Preference
  interest_type: string
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

/**
 * Initial form data for Housing
 */
export const HOUSING_INITIAL_DATA: HousingFormData = {
  // Step 1 - Personal
  national_id: '',
  full_name: '',
  date_of_birth: '',

  // Step 2 - Contact
  phone_number: '',
  email: '',

  // Step 3 - Living Situation
  current_address: '',
  current_district: '',
  current_housing_type: '',
  monthly_rent: '',
  number_of_residents: 1,

  // Step 4 - Preference
  interest_type: '',
  preferred_district: '',

  // Step 5 - Reason
  application_reason: '',

  // Step 6 - Income
  income_source: '',
  monthly_income_applicant: '',
  monthly_income_partner: '',

  // Step 7 - Urgency
  has_disability: false,
  has_emergency: false,
  urgency_details: '',

  // Step 8 - Review
  declaration_accepted: false,
}

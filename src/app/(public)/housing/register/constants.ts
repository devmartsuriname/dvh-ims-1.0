/**
 * Housing Registration Wizard Constants
 * 
 * Predefined options and wizard configuration
 * Phase 5 - Checkpoint 5
 */

export const HOUSING_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'room', label: 'Room' },
  { value: 'shared', label: 'Shared accommodation' },
  { value: 'other', label: 'Other' },
] as const

export const INTEREST_TYPES = [
  { value: 'rent', label: 'Rent' },
  { value: 'rent_to_own', label: 'Rent-to-own' },
  { value: 'purchase', label: 'Purchase' },
] as const

export const APPLICATION_REASONS = [
  { value: 'no_housing', label: 'Currently without proper housing' },
  { value: 'overcrowding', label: 'Overcrowded living conditions' },
  { value: 'unsafe', label: 'Unsafe or unhealthy housing' },
  { value: 'calamity', label: 'Calamity / disaster affected' },
  { value: 'eviction', label: 'Facing eviction' },
  { value: 'family_growth', label: 'Family growth' },
  { value: 'other', label: 'Other reason' },
] as const

export const INCOME_SOURCES = [
  { value: 'employment', label: 'Employment' },
  { value: 'self_employed', label: 'Self-employed' },
  { value: 'pension', label: 'Pension' },
  { value: 'social_assistance', label: 'Social assistance' },
  { value: 'unemployment', label: 'Unemployment benefits' },
  { value: 'other', label: 'Other' },
  { value: 'none', label: 'No income' },
] as const

export const WIZARD_STEPS = [
  { title: 'Introduction' },
  { title: 'Personal Info' },
  { title: 'Contact' },
  { title: 'Living Situation' },
  { title: 'Preference' },
  { title: 'Reason' },
  { title: 'Income' },
  { title: 'Urgency' },
  { title: 'Review' },
  { title: 'Receipt' },
] as const

export const INITIAL_FORM_DATA = {
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

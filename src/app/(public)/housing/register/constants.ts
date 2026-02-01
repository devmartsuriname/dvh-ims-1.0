/**
 * Housing Registration Wizard Constants
 * 
 * Predefined options and wizard configuration
 * i18n enabled - uses labelKey pattern for translations
 * 
 * UPDATED: Phase 5B - Full NL localization
 */

export const HOUSING_TYPES = [
  { value: 'house', labelKey: 'housing.housingTypes.house' },
  { value: 'apartment', labelKey: 'housing.housingTypes.apartment' },
  { value: 'room', labelKey: 'housing.housingTypes.room' },
  { value: 'shared', labelKey: 'housing.housingTypes.shared' },
  { value: 'other', labelKey: 'housing.housingTypes.other' },
] as const

export const INTEREST_TYPES = [
  { value: 'rent', labelKey: 'housing.interestTypes.rent' },
  { value: 'rent_to_own', labelKey: 'housing.interestTypes.rent_to_own' },
  { value: 'purchase', labelKey: 'housing.interestTypes.purchase' },
] as const

export const APPLICATION_REASONS = [
  { value: 'no_housing', labelKey: 'housing.reasons.no_housing' },
  { value: 'overcrowding', labelKey: 'housing.reasons.overcrowding' },
  { value: 'unsafe', labelKey: 'housing.reasons.unsafe' },
  { value: 'calamity', labelKey: 'housing.reasons.calamity' },
  { value: 'eviction', labelKey: 'housing.reasons.eviction' },
  { value: 'family_growth', labelKey: 'housing.reasons.family_growth' },
  { value: 'other', labelKey: 'housing.reasons.other' },
] as const

export const INCOME_SOURCES = [
  { value: 'employment', labelKey: 'housing.incomeSources.employment' },
  { value: 'self_employed', labelKey: 'housing.incomeSources.self_employed' },
  { value: 'pension', labelKey: 'housing.incomeSources.pension' },
  { value: 'social_assistance', labelKey: 'housing.incomeSources.social_assistance' },
  { value: 'unemployment', labelKey: 'housing.incomeSources.unemployment' },
  { value: 'other', labelKey: 'housing.incomeSources.other' },
  { value: 'none', labelKey: 'housing.incomeSources.none' },
] as const

export const GENDER_OPTIONS = [
  { value: 'male', labelKey: 'housing.gender.male' },
  { value: 'female', labelKey: 'housing.gender.female' },
  { value: 'other', labelKey: 'housing.gender.other' },
] as const

export const WIZARD_STEPS = [
  { titleKey: 'wizard.steps.introduction' },
  { titleKey: 'wizard.steps.personalInfo' },
  { titleKey: 'wizard.steps.contact' },
  { titleKey: 'wizard.steps.livingSituation' },
  { titleKey: 'wizard.steps.preference' },
  { titleKey: 'wizard.steps.reason' },
  { titleKey: 'wizard.steps.income' },
  { titleKey: 'wizard.steps.urgency' },
  { titleKey: 'wizard.steps.review' },
  { titleKey: 'wizard.steps.receipt' },
] as const

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

  // Step 3 - Living Situation (aligned with Edge Function contract)
  address_line_1: '',
  district: '',
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

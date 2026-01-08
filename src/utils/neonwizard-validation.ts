/**
 * Neonwizard Validation Utilities
 * Phase 9B-1: Interactivity Wiring (NO DB)
 * 
 * Client-side validation for each wizard step
 * Returns errors object: { fieldName: errorMessage }
 * 
 * NO Supabase | NO API calls | NO jQuery
 */

export type ValidationErrors = Record<string, string>

/**
 * Validate Step 1: Service Selection
 */
export function validateStep1(formData: Record<string, unknown>): ValidationErrors {
  const errors: ValidationErrors = {}
  
  const serviceName = formData.service_name as string | undefined
  if (!serviceName || serviceName.trim() === '') {
    errors.service_name = 'Please select a service'
  }
  
  return errors
}

/**
 * Validate Step 2: Personal Information
 */
export function validateStep2(formData: Record<string, unknown>): ValidationErrors {
  const errors: ValidationErrors = {}
  
  const fullName = formData.full_name as string | undefined
  const email = formData.email as string | undefined
  
  if (!fullName || fullName.trim().length < 2) {
    errors.full_name = 'Please enter your full name (at least 2 characters)'
  }
  
  if (!email || email.trim() === '') {
    errors.email = 'Please enter your email address'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address'
  }
  
  return errors
}

/**
 * Validate Step 3: Service Type Selection
 */
export function validateStep3(formData: Record<string, unknown>): ValidationErrors {
  const errors: ValidationErrors = {}
  
  const webService = formData.web_service as string | undefined
  if (!webService || webService.trim() === '') {
    errors.web_service = 'Please select a service type'
  }
  
  return errors
}

/**
 * Validate Step 4: Budget and Options
 */
export function validateStep4(formData: Record<string, unknown>): ValidationErrors {
  const errors: ValidationErrors = {}
  
  const budget = formData.budget as string | undefined
  if (!budget || budget.trim() === '') {
    errors.budget = 'Please select a budget range'
  }
  
  return errors
}

/**
 * Validate Step 5: Final Details
 */
export function validateStep5(formData: Record<string, unknown>): ValidationErrors {
  const errors: ValidationErrors = {}
  
  const date = formData.date as string | undefined
  const yourPlan = formData.your_plan as string | undefined
  
  if (!date || date.trim() === '') {
    errors.date = 'Please select a date'
  }
  
  if (!yourPlan || yourPlan.trim() === '') {
    errors.your_plan = 'Please select a plan'
  }
  
  return errors
}

/**
 * Validate step by number
 */
export function validateStep(step: number, formData: Record<string, unknown>): ValidationErrors {
  switch (step) {
    case 1:
      return validateStep1(formData)
    case 2:
      return validateStep2(formData)
    case 3:
      return validateStep3(formData)
    case 4:
      return validateStep4(formData)
    case 5:
      return validateStep5(formData)
    default:
      return {}
  }
}

/**
 * Check if validation passed (no errors)
 */
export function isValid(errors: ValidationErrors): boolean {
  return Object.keys(errors).length === 0
}

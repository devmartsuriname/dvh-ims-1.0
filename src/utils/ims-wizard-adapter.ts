/**
 * IMS Wizard Adapter
 * Phase 9B-2: IMS Logic Adapter (NO DB)
 * 
 * Maps Neonwizard visual steps (1-5) to IMS internal steps
 * Provides service-specific configuration and validation
 * 
 * Restore Point: PHASE-9B-2-BEFORE-ADAPTER
 * 
 * NO Supabase | NO API calls | NO jQuery
 */

import type { ServiceType } from '@/context/NeonwizardContext'
import { 
  BOUWSUBSIDIE_INITIAL_DATA, 
  type BouwsubsidieFormData,
  step1PersonalInfoSchema as bsStep1Schema,
  step2ContactInfoSchema as bsStep2Schema,
  step3HouseholdSchema as bsStep3Schema,
  step4AddressSchema as bsStep4Schema,
  step5ContextSchema as bsStep5Schema,
  step7ReviewSchema as bsStep7Schema,
} from '@/validation/bouwsubsidie-schemas'
import { 
  HOUSING_INITIAL_DATA, 
  type HousingFormData,
  step1PersonalInfoSchema as hsStep1Schema,
  step2ContactInfoSchema as hsStep2Schema,
  step3LivingSituationSchema as hsStep3Schema,
  step4HousingPreferenceSchema as hsStep4Schema,
  step5ReasonSchema as hsStep5Schema,
  step6IncomeSchema as hsStep6Schema,
  step8ReviewSchema as hsStep8Schema,
} from '@/validation/housing-schemas'

/**
 * IMS Step Mapping per Visual Step
 * 
 * Bouwsubsidie: 9 IMS steps → 5 visual steps
 * Housing: 10 IMS steps → 5 visual steps
 */
export interface SubStepConfig {
  imsStep: number
  title: string
  description: string
  fields: string[]
}

export interface VisualStepConfig {
  visualStep: number
  title: string
  subSteps: SubStepConfig[]
}

/**
 * Bouwsubsidie Visual Step Configuration
 */
export const BOUWSUBSIDIE_STEP_CONFIG: VisualStepConfig[] = [
  {
    visualStep: 1,
    title: 'Get Started',
    subSteps: [
      { imsStep: 0, title: 'Service Selection', description: 'Select the service you need', fields: [] }
    ]
  },
  {
    visualStep: 2,
    title: 'Personal Information',
    subSteps: [
      { 
        imsStep: 1, 
        title: 'Personal Identification', 
        description: 'Please provide your personal details as they appear on your National ID.',
        fields: ['national_id', 'full_name', 'date_of_birth', 'gender'] 
      },
      { 
        imsStep: 2, 
        title: 'Contact Information', 
        description: 'How can we reach you regarding your application?',
        fields: ['phone_number', 'email'] 
      }
    ]
  },
  {
    visualStep: 3,
    title: 'Household & Address',
    subSteps: [
      { 
        imsStep: 3, 
        title: 'Household Information', 
        description: 'Tell us about your household composition.',
        fields: ['household_size', 'dependents'] 
      },
      { 
        imsStep: 4, 
        title: 'Current Address', 
        description: 'Where do you currently reside?',
        fields: ['address_line', 'district', 'ressort'] 
      }
    ]
  },
  {
    visualStep: 4,
    title: 'Application Details',
    subSteps: [
      { 
        imsStep: 5, 
        title: 'Application Context', 
        description: 'Tell us more about your construction subsidy request.',
        fields: ['application_reason', 'estimated_amount', 'is_calamity'] 
      },
      { 
        imsStep: 6, 
        title: 'Document Declaration', 
        description: 'Please indicate which required documents you have available.',
        fields: ['documents'] 
      }
    ]
  },
  {
    visualStep: 5,
    title: 'Review & Submit',
    subSteps: [
      { 
        imsStep: 7, 
        title: 'Review Application', 
        description: 'Please review your information before submitting.',
        fields: ['declaration_accepted'] 
      }
    ]
  }
]

/**
 * Housing Visual Step Configuration
 */
export const HOUSING_STEP_CONFIG: VisualStepConfig[] = [
  {
    visualStep: 1,
    title: 'Get Started',
    subSteps: [
      { imsStep: 0, title: 'Service Selection', description: 'Select the service you need', fields: [] }
    ]
  },
  {
    visualStep: 2,
    title: 'Personal Information',
    subSteps: [
      { 
        imsStep: 1, 
        title: 'Personal Identification', 
        description: 'Please provide your personal details as they appear on your National ID.',
        fields: ['national_id', 'full_name', 'date_of_birth'] 
      },
      { 
        imsStep: 2, 
        title: 'Contact Information', 
        description: 'How can we reach you regarding your registration?',
        fields: ['phone_number', 'email'] 
      }
    ]
  },
  {
    visualStep: 3,
    title: 'Housing Details',
    subSteps: [
      { 
        imsStep: 3, 
        title: 'Current Living Situation', 
        description: 'Tell us about where you currently live.',
        fields: ['current_address', 'current_district', 'current_housing_type', 'monthly_rent', 'number_of_residents'] 
      },
      { 
        imsStep: 4, 
        title: 'Housing Preference', 
        description: 'What type of housing are you interested in?',
        fields: ['interest_type', 'preferred_district'] 
      }
    ]
  },
  {
    visualStep: 4,
    title: 'Application Details',
    subSteps: [
      { 
        imsStep: 5, 
        title: 'Reason for Application', 
        description: 'Why are you applying for housing registration?',
        fields: ['application_reason'] 
      },
      { 
        imsStep: 6, 
        title: 'Income Information', 
        description: 'Please provide information about your income.',
        fields: ['income_source', 'monthly_income_applicant', 'monthly_income_partner'] 
      },
      { 
        imsStep: 7, 
        title: 'Special Needs & Urgency', 
        description: 'Do you have any special circumstances that require urgent attention?',
        fields: ['has_disability', 'has_emergency', 'urgency_details'] 
      }
    ]
  },
  {
    visualStep: 5,
    title: 'Review & Submit',
    subSteps: [
      { 
        imsStep: 8, 
        title: 'Review Application', 
        description: 'Please review your information before submitting.',
        fields: ['declaration_accepted'] 
      }
    ]
  }
]

/**
 * Get step configuration for a service
 */
export function getStepConfig(service: ServiceType): VisualStepConfig[] {
  if (service === 'bouwsubsidie') {
    return BOUWSUBSIDIE_STEP_CONFIG
  }
  if (service === 'housing') {
    return HOUSING_STEP_CONFIG
  }
  return []
}

/**
 * Get initial form data for a service
 */
export function getInitialFormData(service: ServiceType): BouwsubsidieFormData | HousingFormData | Record<string, unknown> {
  if (service === 'bouwsubsidie') {
    return { ...BOUWSUBSIDIE_INITIAL_DATA }
  }
  if (service === 'housing') {
    return { ...HOUSING_INITIAL_DATA }
  }
  return {}
}

/**
 * Get current sub-step configuration
 */
export function getCurrentSubStep(
  service: ServiceType,
  visualStep: number,
  subStep: number
): SubStepConfig | null {
  const config = getStepConfig(service)
  const visualConfig = config.find(c => c.visualStep === visualStep)
  if (!visualConfig) return null
  
  const subStepIndex = Math.min(subStep - 1, visualConfig.subSteps.length - 1)
  return visualConfig.subSteps[subStepIndex] || null
}

/**
 * Get total sub-steps for a visual step
 */
export function getTotalSubSteps(service: ServiceType, visualStep: number): number {
  const config = getStepConfig(service)
  const visualConfig = config.find(c => c.visualStep === visualStep)
  return visualConfig?.subSteps.length || 1
}

/**
 * Get visual step from IMS step
 */
export function getVisualStepFromIms(service: ServiceType, imsStep: number): number {
  const config = getStepConfig(service)
  for (const visual of config) {
    for (const sub of visual.subSteps) {
      if (sub.imsStep === imsStep) {
        return visual.visualStep
      }
    }
  }
  return 1
}

/**
 * Validate current sub-step using IMS yup schemas
 * Returns errors object or empty object if valid
 */
export async function validateSubStep(
  service: ServiceType,
  visualStep: number,
  subStep: number,
  formData: Record<string, unknown>
): Promise<Record<string, string>> {
  const subStepConfig = getCurrentSubStep(service, visualStep, subStep)
  if (!subStepConfig) return {}
  
  const imsStep = subStepConfig.imsStep
  
  try {
    if (service === 'bouwsubsidie') {
      switch (imsStep) {
        case 1:
          await bsStep1Schema.validate(formData, { abortEarly: false })
          break
        case 2:
          await bsStep2Schema.validate(formData, { abortEarly: false })
          break
        case 3:
          await bsStep3Schema.validate(formData, { abortEarly: false })
          break
        case 4:
          await bsStep4Schema.validate(formData, { abortEarly: false })
          break
        case 5:
          await bsStep5Schema.validate(formData, { abortEarly: false })
          break
        case 7:
          await bsStep7Schema.validate(formData, { abortEarly: false })
          break
        case 6:
          // Documents step - no strict validation
          break
      }
    } else if (service === 'housing') {
      switch (imsStep) {
        case 1:
          await hsStep1Schema.validate(formData, { abortEarly: false })
          break
        case 2:
          await hsStep2Schema.validate(formData, { abortEarly: false })
          break
        case 3:
          await hsStep3Schema.validate(formData, { abortEarly: false })
          break
        case 4:
          await hsStep4Schema.validate(formData, { abortEarly: false })
          break
        case 5:
          await hsStep5Schema.validate(formData, { abortEarly: false })
          break
        case 6:
          await hsStep6Schema.validate(formData, { abortEarly: false })
          break
        case 7:
          // Urgency step - no strict validation (optional fields)
          break
        case 8:
          await hsStep8Schema.validate(formData, { abortEarly: false })
          break
      }
    }
    return {}
  } catch (error) {
    if (error && typeof error === 'object' && 'inner' in error) {
      const yupError = error as { inner: Array<{ path: string; message: string }> }
      const errors: Record<string, string> = {}
      yupError.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message
        }
      })
      return errors
    }
    return {}
  }
}

/**
 * Get progress percentage for current position
 */
export function getProgressPercentage(visualStep: number, subStep: number, totalSubSteps: number): number {
  const baseProgress = ((visualStep - 1) / 5) * 100
  const subProgress = (subStep / totalSubSteps) * (100 / 5)
  return Math.min(100, baseProgress + subProgress)
}

/**
 * Format reference number for a service
 */
export function formatReferenceNumber(service: ServiceType): string {
  const prefix = service === 'bouwsubsidie' ? 'BS' : 'WR'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

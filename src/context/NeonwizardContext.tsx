/**
 * NeonwizardContext - Wizard State Management
 * Phase 9B-2: IMS Logic Adapter (NO DB)
 * 
 * Restore Point: PHASE-9B-2-BEFORE-ADAPTER
 * 
 * Features:
 * - Step navigation (1-5 visual steps)
 * - IMS sub-step tracking
 * - Service selection branching (bouwsubsidie / housing)
 * - Typed IMS form data collection
 * - Validation errors
 * - sessionStorage persistence with version guard
 * 
 * NO Supabase | NO API calls | NO jQuery
 */

import { createContext, useReducer, useEffect, type ReactNode, type Dispatch } from 'react'
import { getInitialFormData } from '@/utils/ims-wizard-adapter'

// Storage configuration
const STORAGE_KEY = 'neonwizard_state'
const STORAGE_VERSION = 2 // Incremented for IMS adapter

// Service types
export type ServiceType = 'bouwsubsidie' | 'housing' | 'status' | null

// Wizard state shape
export interface WizardState {
  version: number
  currentStep: number        // Visual step (1-5)
  subStep: number            // Sub-step within visual step (1-based)
  selectedService: ServiceType
  formData: Record<string, unknown>
  validationErrors: Record<string, string>
  isSubmitted: boolean
  submissionReference: string | null
}

// Initial state
const initialState: WizardState = {
  version: STORAGE_VERSION,
  currentStep: 1,
  subStep: 1,
  selectedService: null,
  formData: {},
  validationErrors: {},
  isSubmitted: false,
  submissionReference: null,
}

// Action types
export type WizardAction =
  | { type: 'SET_STEP'; step: number }
  | { type: 'SET_SUBSTEP'; subStep: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'NEXT_SUBSTEP'; totalSubSteps: number }
  | { type: 'PREV_SUBSTEP' }
  | { type: 'SELECT_SERVICE'; service: ServiceType }
  | { type: 'INIT_SERVICE_FORM'; service: ServiceType }
  | { type: 'UPDATE_FORM_DATA'; data: Record<string, unknown> }
  | { type: 'SET_VALIDATION_ERROR'; field: string; error: string }
  | { type: 'SET_VALIDATION_ERRORS'; errors: Record<string, string> }
  | { type: 'CLEAR_VALIDATION_ERRORS' }
  | { type: 'CLEAR_FIELD_ERROR'; field: string }
  | { type: 'SUBMIT_SUCCESS'; reference: string }
  | { type: 'RESET_WIZARD' }
  | { type: 'HYDRATE'; state: WizardState }

// Reducer
function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { 
        ...state, 
        currentStep: Math.max(1, Math.min(5, action.step)),
        subStep: 1 // Reset sub-step when changing visual step
      }

    case 'SET_SUBSTEP':
      return { ...state, subStep: Math.max(1, action.subStep) }

    case 'NEXT_STEP':
      return { 
        ...state, 
        currentStep: Math.min(5, state.currentStep + 1),
        subStep: 1 // Reset sub-step when advancing
      }

    case 'PREV_STEP':
      return { 
        ...state, 
        currentStep: Math.max(1, state.currentStep - 1),
        subStep: 1 // Reset sub-step when going back
      }

    case 'NEXT_SUBSTEP':
      // If at last sub-step, advance visual step
      if (state.subStep >= action.totalSubSteps) {
        return {
          ...state,
          currentStep: Math.min(5, state.currentStep + 1),
          subStep: 1
        }
      }
      return { ...state, subStep: state.subStep + 1 }

    case 'PREV_SUBSTEP':
      // If at first sub-step, go back to previous visual step
      if (state.subStep <= 1) {
        return {
          ...state,
          currentStep: Math.max(1, state.currentStep - 1),
          subStep: 1 // Will be set to last sub-step by the hook
        }
      }
      return { ...state, subStep: state.subStep - 1 }

    case 'SELECT_SERVICE':
      return { ...state, selectedService: action.service }

    case 'INIT_SERVICE_FORM':
      const initialData = getInitialFormData(action.service)
      return { 
        ...state, 
        selectedService: action.service,
        formData: initialData as Record<string, unknown>
      }

    case 'UPDATE_FORM_DATA':
      return { ...state, formData: { ...state.formData, ...action.data } }

    case 'SET_VALIDATION_ERROR':
      return {
        ...state,
        validationErrors: { ...state.validationErrors, [action.field]: action.error },
      }

    case 'SET_VALIDATION_ERRORS':
      return {
        ...state,
        validationErrors: { ...state.validationErrors, ...action.errors },
      }

    case 'CLEAR_VALIDATION_ERRORS':
      return { ...state, validationErrors: {} }

    case 'CLEAR_FIELD_ERROR':
      const { [action.field]: _, ...remainingErrors } = state.validationErrors
      return { ...state, validationErrors: remainingErrors }

    case 'SUBMIT_SUCCESS':
      return { ...state, isSubmitted: true, submissionReference: action.reference }

    case 'RESET_WIZARD':
      return { ...initialState }

    case 'HYDRATE':
      // Only hydrate if version matches
      if (action.state.version === STORAGE_VERSION) {
        return action.state
      }
      // Version mismatch: reset to initial state
      return { ...initialState }

    default:
      return state
  }
}

// Context types
interface NeonwizardContextType {
  state: WizardState
  dispatch: Dispatch<WizardAction>
}

// Create context
export const NeonwizardContext = createContext<NeonwizardContextType | null>(null)

// Provider component
interface NeonwizardProviderProps {
  children: ReactNode
}

export function NeonwizardProvider({ children }: NeonwizardProviderProps) {
  const [state, dispatch] = useReducer(wizardReducer, initialState)

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as WizardState
        // Validate structure before hydrating
        if (
          typeof parsed === 'object' &&
          parsed !== null &&
          typeof parsed.version === 'number' &&
          typeof parsed.currentStep === 'number'
        ) {
          dispatch({ type: 'HYDRATE', state: parsed })
        }
      }
    } catch (error) {
      // Failed to parse: reset to clean state
      console.warn('Failed to hydrate wizard state, using fresh state')
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  // Persist to sessionStorage on state change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.warn('Failed to persist wizard state')
    }
  }, [state])

  return (
    <NeonwizardContext.Provider value={{ state, dispatch }}>
      {children}
    </NeonwizardContext.Provider>
  )
}

export default NeonwizardContext

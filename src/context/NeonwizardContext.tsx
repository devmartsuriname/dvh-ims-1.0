/**
 * NeonwizardContext - Wizard State Management
 * Phase 9B-1: Interactivity Wiring (NO DB)
 * 
 * Restore Point: PHASE-9B-1-BEFORE-WIRING
 * 
 * Features:
 * - Step navigation (1-5)
 * - Service selection branching
 * - Form data collection
 * - Basic validation errors
 * - sessionStorage persistence with version guard
 * 
 * NO Supabase | NO API calls | NO jQuery
 */

import { createContext, useReducer, useEffect, type ReactNode, type Dispatch } from 'react'

// Storage configuration
const STORAGE_KEY = 'neonwizard_state'
const STORAGE_VERSION = 1

// Service types
export type ServiceType = 'bouwsubsidie' | 'housing' | 'status' | null

// Wizard state shape
export interface WizardState {
  version: number
  currentStep: number
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
  selectedService: null,
  formData: {},
  validationErrors: {},
  isSubmitted: false,
  submissionReference: null,
}

// Action types
export type WizardAction =
  | { type: 'SET_STEP'; step: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SELECT_SERVICE'; service: ServiceType }
  | { type: 'UPDATE_FORM_DATA'; data: Record<string, unknown> }
  | { type: 'SET_VALIDATION_ERROR'; field: string; error: string }
  | { type: 'CLEAR_VALIDATION_ERRORS' }
  | { type: 'CLEAR_FIELD_ERROR'; field: string }
  | { type: 'SUBMIT_SUCCESS'; reference: string }
  | { type: 'RESET_WIZARD' }
  | { type: 'HYDRATE'; state: WizardState }

// Reducer
function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: Math.max(1, Math.min(5, action.step)) }

    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(5, state.currentStep + 1) }

    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(1, state.currentStep - 1) }

    case 'SELECT_SERVICE':
      return { ...state, selectedService: action.service }

    case 'UPDATE_FORM_DATA':
      return { ...state, formData: { ...state.formData, ...action.data } }

    case 'SET_VALIDATION_ERROR':
      return {
        ...state,
        validationErrors: { ...state.validationErrors, [action.field]: action.error },
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

/**
 * useNeonwizard - Custom hook for wizard state and navigation
 * Phase 9B-2: IMS Logic Adapter (NO DB)
 * 
 * Provides:
 * - State access (visual step, sub-step, IMS step)
 * - Navigation helpers (next, back, goToStep)
 * - Form data management with IMS typing
 * - IMS validation via yup schemas
 * - Service selection
 * 
 * NO Supabase | NO API calls | NO jQuery
 */

import { useContext, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { NeonwizardContext, type ServiceType } from '@/context/NeonwizardContext'
import { 
  getTotalSubSteps, 
  getCurrentSubStep,
  validateSubStep,
  formatReferenceNumber,
  getStepConfig,
  type SubStepConfig
} from '@/utils/ims-wizard-adapter'

export function useNeonwizard() {
  const context = useContext(NeonwizardContext)
  const navigate = useNavigate()

  if (!context) {
    throw new Error('useNeonwizard must be used within a NeonwizardProvider')
  }

  const { state, dispatch } = context

  // Get total sub-steps for current visual step
  const totalSubSteps = getTotalSubSteps(state.selectedService, state.currentStep)

  // Get current sub-step configuration
  const currentSubStepConfig = getCurrentSubStep(
    state.selectedService, 
    state.currentStep, 
    state.subStep
  )

  // Get step config for current service
  const stepConfig = getStepConfig(state.selectedService)

  // Navigation helpers
  const nextStep = useCallback(() => {
    dispatch({ type: 'CLEAR_VALIDATION_ERRORS' })
    dispatch({ type: 'NEXT_STEP' })
  }, [dispatch])

  const prevStep = useCallback(() => {
    dispatch({ type: 'CLEAR_VALIDATION_ERRORS' })
    dispatch({ type: 'PREV_STEP' })
  }, [dispatch])

  const goToStep = useCallback((step: number) => {
    dispatch({ type: 'CLEAR_VALIDATION_ERRORS' })
    dispatch({ type: 'SET_STEP', step })
  }, [dispatch])

  // Sub-step navigation
  const nextSubStep = useCallback(() => {
    dispatch({ type: 'CLEAR_VALIDATION_ERRORS' })
    dispatch({ type: 'NEXT_SUBSTEP', totalSubSteps })
  }, [dispatch, totalSubSteps])

  const prevSubStep = useCallback(() => {
    dispatch({ type: 'CLEAR_VALIDATION_ERRORS' })
    dispatch({ type: 'PREV_SUBSTEP' })
  }, [dispatch])

  const goToSubStep = useCallback((subStep: number) => {
    dispatch({ type: 'CLEAR_VALIDATION_ERRORS' })
    dispatch({ type: 'SET_SUBSTEP', subStep })
  }, [dispatch])

  // Set sub-step to last of previous visual step (used when going back)
  const goToPreviousVisualStepLastSubStep = useCallback(() => {
    if (state.currentStep > 1) {
      const prevStep = state.currentStep - 1
      const prevTotalSubSteps = getTotalSubSteps(state.selectedService, prevStep)
      dispatch({ type: 'CLEAR_VALIDATION_ERRORS' })
      dispatch({ type: 'SET_STEP', step: prevStep })
      dispatch({ type: 'SET_SUBSTEP', subStep: prevTotalSubSteps })
    }
  }, [dispatch, state.currentStep, state.selectedService])

  // Service selection
  const selectService = useCallback((service: ServiceType) => {
    dispatch({ type: 'SELECT_SERVICE', service })
  }, [dispatch])

  // Initialize service form with typed data
  const initServiceForm = useCallback((service: ServiceType) => {
    dispatch({ type: 'INIT_SERVICE_FORM', service })
  }, [dispatch])

  // Handle service selection and navigation
  const handleServiceSelection = useCallback((service: ServiceType) => {
    if (service === 'status') {
      // Navigate to existing status page (no route changes)
      navigate('/status')
    } else {
      // Initialize form data for selected service
      initServiceForm(service)
      // Advance to step 2
      dispatch({ type: 'NEXT_STEP' })
    }
  }, [dispatch, navigate, initServiceForm])

  // Form data management
  const updateFormData = useCallback((data: Record<string, unknown>) => {
    dispatch({ type: 'UPDATE_FORM_DATA', data })
  }, [dispatch])

  // Validation helpers
  const setError = useCallback((field: string, error: string) => {
    dispatch({ type: 'SET_VALIDATION_ERROR', field, error })
  }, [dispatch])

  const setErrors = useCallback((errors: Record<string, string>) => {
    dispatch({ type: 'SET_VALIDATION_ERRORS', errors })
  }, [dispatch])

  const clearError = useCallback((field: string) => {
    dispatch({ type: 'CLEAR_FIELD_ERROR', field })
  }, [dispatch])

  const clearAllErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_VALIDATION_ERRORS' })
  }, [dispatch])

  // Check if a field has an error
  const hasError = useCallback((field: string): boolean => {
    return !!state.validationErrors[field]
  }, [state.validationErrors])

  // Get error message for a field
  const getError = useCallback((field: string): string | undefined => {
    return state.validationErrors[field]
  }, [state.validationErrors])

  // Validate current sub-step using IMS schemas
  const validateCurrentSubStep = useCallback(async (): Promise<boolean> => {
    const errors = await validateSubStep(
      state.selectedService,
      state.currentStep,
      state.subStep,
      state.formData
    )
    
    if (Object.keys(errors).length > 0) {
      setErrors(errors)
      return false
    }
    
    clearAllErrors()
    return true
  }, [state.selectedService, state.currentStep, state.subStep, state.formData, setErrors, clearAllErrors])

  // Handle validated next with IMS schema
  const handleValidatedNext = useCallback(async () => {
    const isValid = await validateCurrentSubStep()
    if (isValid) {
      nextSubStep()
    }
  }, [validateCurrentSubStep, nextSubStep])

  // Handle back navigation with sub-step awareness
  const handleBack = useCallback(() => {
    if (state.subStep > 1) {
      prevSubStep()
    } else if (state.currentStep > 1) {
      goToPreviousVisualStepLastSubStep()
    }
  }, [state.subStep, state.currentStep, prevSubStep, goToPreviousVisualStepLastSubStep])

  // Submit handler (mock - no DB)
  const handleSubmit = useCallback(() => {
    const reference = formatReferenceNumber(state.selectedService)
    dispatch({ type: 'SUBMIT_SUCCESS', reference })
  }, [dispatch, state.selectedService])

  // Reset wizard
  const resetWizard = useCallback(() => {
    dispatch({ type: 'RESET_WIZARD' })
  }, [dispatch])

  // Get progress percentage
  const getProgress = useCallback(() => {
    const baseProgress = ((state.currentStep - 1) / 5) * 100
    const subProgress = (state.subStep / totalSubSteps) * (100 / 5)
    return Math.min(100, Math.round(baseProgress + subProgress))
  }, [state.currentStep, state.subStep, totalSubSteps])

  return {
    // State
    currentStep: state.currentStep,
    subStep: state.subStep,
    totalSubSteps,
    selectedService: state.selectedService,
    formData: state.formData,
    validationErrors: state.validationErrors,
    isSubmitted: state.isSubmitted,
    submissionReference: state.submissionReference,
    
    // IMS Configuration
    currentSubStepConfig,
    stepConfig,
    
    // Visual step navigation
    nextStep,
    prevStep,
    goToStep,
    
    // Sub-step navigation
    nextSubStep,
    prevSubStep,
    goToSubStep,
    
    // IMS-aware navigation
    handleValidatedNext,
    handleBack,
    
    // Service
    selectService,
    initServiceForm,
    handleServiceSelection,
    
    // Form data
    updateFormData,
    
    // Validation
    setError,
    setErrors,
    clearError,
    clearAllErrors,
    hasError,
    getError,
    validateCurrentSubStep,
    
    // Actions
    handleSubmit,
    resetWizard,
    
    // Progress
    getProgress,
  }
}

export default useNeonwizard

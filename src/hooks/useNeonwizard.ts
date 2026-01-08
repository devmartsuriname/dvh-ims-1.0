/**
 * useNeonwizard - Custom hook for wizard state and navigation
 * Phase 9B-1: Interactivity Wiring (NO DB)
 * 
 * Provides:
 * - State access
 * - Navigation helpers (next, back, goToStep)
 * - Form data management
 * - Validation helpers
 * - Service selection
 * 
 * NO Supabase | NO API calls | NO jQuery
 */

import { useContext, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { NeonwizardContext, type ServiceType } from '@/context/NeonwizardContext'

export function useNeonwizard() {
  const context = useContext(NeonwizardContext)
  const navigate = useNavigate()

  if (!context) {
    throw new Error('useNeonwizard must be used within a NeonwizardProvider')
  }

  const { state, dispatch } = context

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

  // Service selection
  const selectService = useCallback((service: ServiceType) => {
    dispatch({ type: 'SELECT_SERVICE', service })
  }, [dispatch])

  // Handle service selection and navigation
  const handleServiceSelection = useCallback((service: ServiceType) => {
    selectService(service)
    
    if (service === 'status') {
      // Navigate to existing status page (no route changes)
      navigate('/status')
    } else {
      // For bouwsubsidie or housing, advance to step 2
      dispatch({ type: 'NEXT_STEP' })
    }
  }, [dispatch, navigate, selectService])

  // Form data management
  const updateFormData = useCallback((data: Record<string, unknown>) => {
    dispatch({ type: 'UPDATE_FORM_DATA', data })
  }, [dispatch])

  // Validation helpers
  const setError = useCallback((field: string, error: string) => {
    dispatch({ type: 'SET_VALIDATION_ERROR', field, error })
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

  // Submit handler (mock - no DB)
  const handleSubmit = useCallback(() => {
    // Generate mock reference number
    const prefix = state.selectedService === 'bouwsubsidie' ? 'BS' : 'HR'
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    const reference = `${prefix}-${timestamp}-${random}`
    
    dispatch({ type: 'SUBMIT_SUCCESS', reference })
  }, [dispatch, state.selectedService])

  // Reset wizard
  const resetWizard = useCallback(() => {
    dispatch({ type: 'RESET_WIZARD' })
  }, [dispatch])

  return {
    // State
    currentStep: state.currentStep,
    selectedService: state.selectedService,
    formData: state.formData,
    validationErrors: state.validationErrors,
    isSubmitted: state.isSubmitted,
    submissionReference: state.submissionReference,
    
    // Navigation
    nextStep,
    prevStep,
    goToStep,
    
    // Service
    selectService,
    handleServiceSelection,
    
    // Form data
    updateFormData,
    
    // Validation
    setError,
    clearError,
    clearAllErrors,
    hasError,
    getError,
    
    // Actions
    handleSubmit,
    resetWizard,
  }
}

export default useNeonwizard

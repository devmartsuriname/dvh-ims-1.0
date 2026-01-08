/**
 * NeonwizardStep4 - Budget and Options
 * Phase 9B-1: Interactive with state management
 * 
 * Features:
 * - Budget selection dropdown
 * - Support period dropdown
 * - Optimization checkboxes
 * - Comments textarea
 * - Next/Back navigation
 * 
 * NO Supabase | NO API calls | NO jQuery
 */

import { useCallback, useEffect } from 'react'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { useNeonwizard } from '@/hooks/useNeonwizard'
import { validateStep4, isValid } from '@/utils/neonwizard-validation'

const NeonwizardStep4 = () => {
  const { 
    currentStep,
    formData, 
    updateFormData, 
    nextStep,
    prevStep,
    setError,
    clearError,
    getError,
  } = useNeonwizard()

  // Handle input change
  const handleChange = useCallback((field: string, value: string | boolean) => {
    updateFormData({ [field]: value })
    clearError(field)
  }, [updateFormData, clearError])

  // Handle checkbox change
  const handleCheckbox = useCallback((field: string, checked: boolean) => {
    updateFormData({ [field]: checked })
  }, [updateFormData])

  // Handle Next with validation
  const handleNext = useCallback(() => {
    const errors = validateStep4(formData)
    
    if (!isValid(errors)) {
      Object.entries(errors).forEach(([field, message]) => {
        setError(field, message)
      })
      return
    }
    
    nextStep()
  }, [formData, nextStep, setError])

  // Set default values on mount
  useEffect(() => {
    if (currentStep === 4) {
      if (!formData.budget) {
        updateFormData({ budget: '$390 - $600' })
      }
      if (formData.code_opti1 === undefined) {
        updateFormData({ code_opti1: true })
      }
    }
  }, [currentStep])

  // Only render if on step 4
  if (currentStep !== 4) return null

  return (
    <div className="multisteps-form__panel js-active" data-animation="slideHorz">
      <div className="wizard-forms">
        <div className="inner pb-100 clearfix">
          <div className="form-content pera-content">
            <div className="step-inner-content">
              <span className="step-no bottom-line">Step 4</span>
              <div className="step-progress float-right">
                <span>4 of 5 completed</span>
                <div className="step-progress-bar">
                  <div className="progress">
                    <div className="progress-bar" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </div>
              <h2>Financial Details</h2>
              <p>
                Please provide information about your financial situation and 
                preferences. This helps us determine the appropriate support level.
              </p>
              <div className="step-content-area">
                <div className="budget-area">
                  <p>
                    <IconifyIcon icon="mingcute:currency-dollar-line" /> Monthly Income Range
                  </p>
                  <select 
                    name="budget"
                    value={(formData.budget as string) || ''}
                    onChange={(e) => handleChange('budget', e.target.value)}
                  >
                    <option value="$390 - $600">NAf 0 - 1,500</option>
                    <option value="$600 - $1000">NAf 1,500 - 3,000</option>
                    <option value="$1000 - $2000">NAf 3,000 - 5,000</option>
                    <option value="$2000 - $5000">NAf 5,000 - 8,000</option>
                    <option value="$5000+">NAf 8,000+</option>
                  </select>
                  {getError('budget') && (
                    <div className="text-danger small mt-1">{getError('budget')}</div>
                  )}
                </div>
                <div className="budget-area">
                  <p>
                    <IconifyIcon icon="mingcute:comment-line" /> Household Size
                  </p>
                  <select 
                    name="support_period"
                    value={(formData.support_period as string) || '1 person'}
                    onChange={(e) => handleChange('support_period', e.target.value)}
                  >
                    <option value="1 person">1 person</option>
                    <option value="2 persons">2 persons</option>
                    <option value="3 persons">3 persons</option>
                    <option value="4 persons">4 persons</option>
                    <option value="5+ persons">5+ persons</option>
                  </select>
                </div>
                <div className="budget-area">
                  <p>Current Living Situation</p>
                  <div className="opti-list">
                    <ul className="d-md-flex">
                      <li className={`bg-white ${formData.code_opti1 ? 'active' : ''}`}>
                        <input
                          type="checkbox"
                          name="code_opti1"
                          value="Renting"
                          checked={!!formData.code_opti1}
                          onChange={(e) => handleCheckbox('code_opti1', e.target.checked)}
                        />
                        Renting
                      </li>
                      <li className={`bg-white ${formData.code_opti2 ? 'active' : ''}`}>
                        <input 
                          type="checkbox" 
                          name="code_opti2" 
                          value="Living with Family"
                          checked={!!formData.code_opti2}
                          onChange={(e) => handleCheckbox('code_opti2', e.target.checked)}
                        />
                        Living with Family
                      </li>
                      <li className={`bg-white ${formData.code_opti3 ? 'active' : ''}`}>
                        <input
                          type="checkbox"
                          name="code_opti3"
                          value="Own Property"
                          checked={!!formData.code_opti3}
                          onChange={(e) => handleCheckbox('code_opti3', e.target.checked)}
                        />
                        Own Property
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="comment-box">
                  <p>
                    <IconifyIcon icon="mingcute:comment-line" /> Additional Financial Information
                  </p>
                  <textarea
                    name="comments-note"
                    placeholder="Please provide any additional financial details that may be relevant..."
                    value={(formData['comments-note'] as string) || ''}
                    onChange={(e) => handleChange('comments-note', e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="actions">
          <ul>
            <li>
              <span className="js-btn-prev" title="BACK" onClick={prevStep} style={{ cursor: 'pointer' }}>
                <IconifyIcon icon="mingcute:arrow-left-line" /> BACK{' '}
              </span>
            </li>
            <li>
              <span className="js-btn-next" title="NEXT" onClick={handleNext} style={{ cursor: 'pointer' }}>
                NEXT <IconifyIcon icon="mingcute:arrow-right-line" />
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default NeonwizardStep4

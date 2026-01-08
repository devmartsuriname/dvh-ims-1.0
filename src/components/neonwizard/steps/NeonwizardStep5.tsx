/**
 * NeonwizardStep5 - Final Step / Review & Submit
 * Phase 9B-1: Interactive with state management
 * 
 * Features:
 * - Date selection
 * - Plan selection (radio)
 * - Additional options checkboxes
 * - Final notes textarea
 * - Submit button (mock - no DB)
 * - Shows confirmation on submit
 * 
 * NO Supabase | NO API calls | NO jQuery
 */

import { useCallback, useEffect } from 'react'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { useNeonwizard } from '@/hooks/useNeonwizard'
import { validateStep5, isValid } from '@/utils/neonwizard-validation'

const NeonwizardStep5 = () => {
  const { 
    currentStep,
    formData, 
    updateFormData, 
    prevStep,
    setError,
    clearError,
    getError,
    handleSubmit,
    isSubmitted,
    submissionReference,
    resetWizard,
    selectedService,
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

  // Handle form submission with validation
  const onSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    const errors = validateStep5(formData)
    
    if (!isValid(errors)) {
      Object.entries(errors).forEach(([field, message]) => {
        setError(field, message)
      })
      return
    }
    
    handleSubmit()
  }, [formData, handleSubmit, setError])

  // Set default values on mount
  useEffect(() => {
    if (currentStep === 5) {
      if (!formData.your_plan) {
        updateFormData({ your_plan: 'Unlimited Plan' })
      }
      if (!formData.date) {
        // Set default date to today
        const today = new Date().toISOString().split('T')[0]
        updateFormData({ date: today })
      }
    }
  }, [currentStep])

  // Only render if on step 5
  if (currentStep !== 5) return null

  // Show confirmation screen if submitted
  if (isSubmitted && submissionReference) {
    const serviceLabel = selectedService === 'bouwsubsidie' 
      ? 'Construction Subsidy' 
      : 'Housing Registration'
    
    return (
      <div className="multisteps-form__panel js-active" data-animation="slideHorz">
        <div className="wizard-forms">
          <div className="inner pb-100 clearfix">
            <div className="form-content pera-content">
              <div className="step-inner-content text-center">
                <div className="mb-4">
                  <IconifyIcon 
                    icon="mingcute:check-circle-fill" 
                    style={{ fontSize: '80px', color: '#28a745' }} 
                  />
                </div>
                <h2>Application Submitted Successfully!</h2>
                <p className="mb-4">
                  Your {serviceLabel} application has been received. Please save your 
                  reference number for future inquiries.
                </p>
                <div 
                  style={{ 
                    background: '#f8f9fa', 
                    padding: '20px', 
                    borderRadius: '8px',
                    marginBottom: '20px' 
                  }}
                >
                  <p className="mb-1 text-muted small">Reference Number:</p>
                  <h3 style={{ fontFamily: 'monospace', letterSpacing: '2px' }}>
                    {submissionReference}
                  </h3>
                </div>
                <p className="text-muted small">
                  You can check the status of your application at any time using 
                  your reference number on the Status page.
                </p>
              </div>
            </div>
          </div>
          <div className="actions">
            <ul>
              <li>
                <span 
                  className="js-btn-prev" 
                  title="Start New Application" 
                  onClick={resetWizard}
                  style={{ cursor: 'pointer' }}
                >
                  <IconifyIcon icon="mingcute:arrow-left-line" /> New Application
                </span>
              </li>
              <li>
                <a href="/status" className="js-btn-next" title="Check Status">
                  Check Status <IconifyIcon icon="mingcute:arrow-right-line" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  const selectedPlan = formData.your_plan as string

  return (
    <div className="multisteps-form__panel js-active" data-animation="slideHorz">
      <div className="wizard-forms">
        <div className="inner pb-100 clearfix">
          <div className="form-content pera-content">
            <div className="step-inner-content">
              <span className="step-no bottom-line">Step 5</span>
              <div className="step-progress float-right">
                <span>5 of 5 completed</span>
                <div className="step-progress-bar">
                  <div className="progress">
                    <div className="progress-bar" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
              <h2>Review & Submit</h2>
              <p>
                Please review your information and select your preferred timeline. 
                Once submitted, you will receive a reference number to track your application.
              </p>
              <div className="step-content-field">
                <div className="date-picker date datepicker">
                  <input 
                    type="date" 
                    name="date" 
                    className={`form-control ${getError('date') ? 'is-invalid' : ''}`}
                    value={(formData.date as string) || ''}
                    onChange={(e) => handleChange('date', e.target.value)}
                  />
                  <div className="input-group-append">
                    <span>PREFERRED START DATE</span>
                  </div>
                  {getError('date') && (
                    <div className="text-danger small mt-1">{getError('date')}</div>
                  )}
                </div>
                <div className="plan-area">
                  <div 
                    className={`plan-icon-text text-center ${selectedPlan === 'Unlimited Plan' ? 'active' : ''}`}
                    onClick={() => handleChange('your_plan', 'Unlimited Plan')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="plan-icon">
                      <IconifyIcon icon="mingcute:crown-line" />
                    </div>
                    <div className="plan-text">
                      <h3>Priority Processing</h3>
                      <p>
                        Your application will be processed with priority status. 
                        Recommended for urgent housing needs or time-sensitive situations.
                      </p>
                      <input
                        type="radio"
                        name="your_plan"
                        value="Unlimited Plan"
                        checked={selectedPlan === 'Unlimited Plan'}
                        onChange={(e) => handleChange('your_plan', e.target.value)}
                      />
                    </div>
                  </div>
                  <div 
                    className={`plan-icon-text text-center ${selectedPlan === 'Limited Plan' ? 'active' : ''}`}
                    onClick={() => handleChange('your_plan', 'Limited Plan')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="plan-icon">
                      <IconifyIcon icon="mingcute:cube-3d-line" />
                    </div>
                    <div className="plan-text">
                      <h3>Standard Processing</h3>
                      <p>
                        Your application will be processed in the standard queue. 
                        Processing time varies based on current volume.
                      </p>
                      <input 
                        type="radio" 
                        name="your_plan" 
                        value="Limited Plan"
                        checked={selectedPlan === 'Limited Plan'}
                        onChange={(e) => handleChange('your_plan', e.target.value)}
                      />
                    </div>
                  </div>
                  {getError('your_plan') && (
                    <div className="text-danger small mt-1">{getError('your_plan')}</div>
                  )}
                </div>
                <div className="budget-area">
                  <p>Additional Preferences</p>
                  <div className="opti-list">
                    <ul className="d-md-flex">
                      <li className={`bg-white ${formData.pref_opti1 ? 'active' : ''}`}>
                        <input
                          type="checkbox"
                          name="pref_opti1"
                          value="Email notifications"
                          checked={!!formData.pref_opti1}
                          onChange={(e) => handleCheckbox('pref_opti1', e.target.checked)}
                        />
                        Email notifications
                      </li>
                      <li className={`bg-white ${formData.pref_opti2 ? 'active' : ''}`}>
                        <input 
                          type="checkbox" 
                          name="pref_opti2" 
                          value="SMS updates"
                          checked={!!formData.pref_opti2}
                          onChange={(e) => handleCheckbox('pref_opti2', e.target.checked)}
                        />
                        SMS updates
                      </li>
                      <li className={`bg-white ${formData.pref_opti3 ? 'active' : ''}`}>
                        <input
                          type="checkbox"
                          name="pref_opti3"
                          value="Newsletter"
                          checked={!!formData.pref_opti3}
                          onChange={(e) => handleCheckbox('pref_opti3', e.target.checked)}
                        />
                        Newsletter
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="comment-box">
                  <textarea 
                    name="extra-message" 
                    placeholder="Any final notes or special requests..."
                    value={(formData['extra-message'] as string) || ''}
                    onChange={(e) => handleChange('extra-message', e.target.value)}
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
              <button type="button" title="SUBMIT" onClick={onSubmit}>
                SUBMIT <IconifyIcon icon="mingcute:arrow-right-line" />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default NeonwizardStep5

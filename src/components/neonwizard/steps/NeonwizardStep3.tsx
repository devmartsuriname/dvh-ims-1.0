/**
 * NeonwizardStep3 - Service Type Selection
 * Phase 9B-1: Interactive with state management
 * 
 * Features:
 * - Service type radio selection
 * - Language dropdown
 * - Comments textarea
 * - Validation for required fields
 * - Next/Back navigation
 * 
 * NO Supabase | NO API calls | NO jQuery
 */

import { useCallback, useEffect } from 'react'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { useNeonwizard } from '@/hooks/useNeonwizard'
import { validateStep3, isValid } from '@/utils/neonwizard-validation'

const NeonwizardStep3 = () => {
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
  const handleChange = useCallback((field: string, value: string) => {
    updateFormData({ [field]: value })
    clearError(field)
  }, [updateFormData, clearError])

  // Handle Next with validation
  const handleNext = useCallback(() => {
    const errors = validateStep3(formData)
    
    if (!isValid(errors)) {
      Object.entries(errors).forEach(([field, message]) => {
        setError(field, message)
      })
      return
    }
    
    nextStep()
  }, [formData, nextStep, setError])

  // Set default selection on mount if none selected
  useEffect(() => {
    if (currentStep === 3 && !formData.web_service) {
      updateFormData({ web_service: 'Web Design' })
    }
  }, [currentStep])

  // Only render if on step 3
  if (currentStep !== 3) return null

  const selectedWebService = formData.web_service as string

  return (
    <div className="multisteps-form__panel js-active" data-animation="slideHorz">
      <div className="wizard-forms">
        <div className="inner pb-100 clearfix">
          <div className="form-content pera-content">
            <div className="step-inner-content">
              <span className="step-no bottom-line">Step 3</span>
              <div className="step-progress float-right">
                <span>3 of 5 completed</span>
                <div className="step-progress-bar">
                  <div className="progress">
                    <div className="progress-bar" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
              <h2>Application Details</h2>
              <p>
                Please provide additional details about your application. This helps 
                us process your request more efficiently.
              </p>
              <div className="services-select-option">
                <ul>
                  <li className={`bg-white ${selectedWebService === 'Web Design' ? 'active' : ''}`}>
                    <label>
                      Urgent Request{' '}
                      <input
                        type="radio"
                        name="web_service"
                        value="Web Design"
                        checked={selectedWebService === 'Web Design'}
                        onChange={(e) => handleChange('web_service', e.target.value)}
                      />
                    </label>
                  </li>
                  <li className={`bg-white ${selectedWebService === 'Web Development' ? 'active' : ''}`}>
                    <label>
                      Standard Request{' '}
                      <input 
                        type="radio" 
                        name="web_service" 
                        value="Web Development"
                        checked={selectedWebService === 'Web Development'}
                        onChange={(e) => handleChange('web_service', e.target.value)}
                      />
                    </label>
                  </li>
                  <li className={`bg-white ${selectedWebService === 'Graphics Design' ? 'active' : ''}`}>
                    <label>
                      Information Only{' '}
                      <input 
                        type="radio" 
                        name="web_service" 
                        value="Graphics Design"
                        checked={selectedWebService === 'Graphics Design'}
                        onChange={(e) => handleChange('web_service', e.target.value)}
                      />
                    </label>
                  </li>
                  <li className={`bg-white ${selectedWebService === 'SEO' ? 'active' : ''}`}>
                    <label>
                      Consultation{' '}
                      <input 
                        type="radio" 
                        name="web_service" 
                        value="SEO"
                        checked={selectedWebService === 'SEO'}
                        onChange={(e) => handleChange('web_service', e.target.value)}
                      />
                    </label>
                  </li>
                </ul>
                {getError('web_service') && (
                  <div className="text-danger small mt-1">{getError('web_service')}</div>
                )}
              </div>
              <div className="language-select">
                <p>Preferred language for communication: </p>
                <select 
                  name="languages"
                  value={(formData.languages as string) || 'English'}
                  onChange={(e) => handleChange('languages', e.target.value)}
                >
                  <option>English</option>
                  <option>Dutch</option>
                  <option>Papiamento</option>
                  <option>Spanish</option>
                </select>
              </div>
              <div className="comment-box">
                <p>
                  <IconifyIcon icon="mingcute:comment-line" /> Additional Notes
                </p>
                <textarea 
                  name="full_comments" 
                  placeholder="Please provide any additional information that may help process your application..."
                  value={(formData.full_comments as string) || ''}
                  onChange={(e) => handleChange('full_comments', e.target.value)}
                ></textarea>
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

export default NeonwizardStep3

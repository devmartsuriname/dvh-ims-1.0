/**
 * NeonwizardStep2 - Personal Information
 * Phase 9B-1: Interactive with state management
 * 
 * Features:
 * - Full name, email, phone inputs
 * - Gender selection
 * - Document upload placeholder
 * - Validation for required fields
 * - Next/Back navigation
 * 
 * NO Supabase | NO API calls | NO jQuery
 */

import { useCallback } from 'react'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { useNeonwizard } from '@/hooks/useNeonwizard'
import { validateStep2, isValid } from '@/utils/neonwizard-validation'

const NeonwizardStep2 = () => {
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
    const errors = validateStep2(formData)
    
    if (!isValid(errors)) {
      Object.entries(errors).forEach(([field, message]) => {
        setError(field, message)
      })
      return
    }
    
    nextStep()
  }, [formData, nextStep, setError])

  // Only render if on step 2
  if (currentStep !== 2) return null

  return (
    <div className="multisteps-form__panel js-active" data-animation="slideHorz">
      <div className="wizard-forms">
        <div className="inner pb-100 clearfix">
          <div className="form-content pera-content">
            <div className="step-inner-content">
              <span className="step-no bottom-line">Step 2</span>
              <div className="step-progress float-right">
                <span>2 of 5 completed</span>
                <div className="step-progress-bar">
                  <div className="progress">
                    <div className="progress-bar" style={{ width: '40%' }}></div>
                  </div>
                </div>
              </div>

              <h2>Personal Information</h2>
              <p>
                Please provide your personal details. This information will be used 
                to process your application and contact you regarding updates.
              </p>

              <div className="form-inner-area">
                <div className="mb-3">
                  <input
                    type="text"
                    name="full_name"
                    className={`form-control required ${getError('full_name') ? 'is-invalid' : ''}`}
                    minLength={2}
                    placeholder="First and last name *"
                    value={(formData.full_name as string) || ''}
                    onChange={(e) => handleChange('full_name', e.target.value)}
                    required
                  />
                  {getError('full_name') && (
                    <div className="text-danger small mt-1">{getError('full_name')}</div>
                  )}
                </div>
                <div className="mb-3">
                  <input
                    type="email"
                    name="email"
                    className={`form-control required ${getError('email') ? 'is-invalid' : ''}`}
                    placeholder="Email Address *"
                    value={(formData.email as string) || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                  {getError('email') && (
                    <div className="text-danger small mt-1">{getError('email')}</div>
                  )}
                </div>
                <input 
                  type="text" 
                  name="phone" 
                  placeholder="Phone (optional)" 
                  value={(formData.phone as string) || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
              <div className="gender-selection">
                <h3>Gender:</h3>
                <label>
                  <input 
                    type="radio" 
                    name="gender" 
                    value="Male" 
                    checked={(formData.gender as string) === 'Male'}
                    onChange={(e) => handleChange('gender', e.target.value)}
                  />
                  <span className="checkmark"></span>Male
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="gender" 
                    value="Female" 
                    checked={(formData.gender as string) === 'Female'}
                    onChange={(e) => handleChange('gender', e.target.value)}
                  />
                  <span className="checkmark"></span>Female
                </label>
              </div>
              <div className="upload-documents">
                <h3>Upload Documents:</h3>
                <div className="upload-araa bg-white">
                  <input type="hidden" value="" name="fileContent" id="fileContent" />
                  <input type="hidden" value="" name="filename" id="filename" />
                  <div className="upload-icon float-left">
                    <IconifyIcon icon="mingcute:cloud-upload-line" />
                  </div>
                  <div className="upload-text">
                    <span>
                      ( File accepted: pdf. doc/ docx - Max file size : 150kb for demo
                      limit )
                    </span>
                  </div>
                  <div className="upload-option text-center">
                    <label htmlFor="attach">Upload The Documents</label>
                    <input id="attach" style={{ display: 'none' }} type="file" />
                  </div>
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

export default NeonwizardStep2

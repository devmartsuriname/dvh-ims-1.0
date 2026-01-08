/**
 * NeonwizardStep2 - Personal Information (IMS Steps 1-2)
 * Phase 9B-2: IMS Logic Adapter (NO DB)
 * 
 * Bouwsubsidie: Personal Info + Contact Info
 * Housing: Personal Info + Contact Info
 * 
 * Uses IMS validation schemas via adapter
 * 
 * NO Supabase | NO API calls | NO jQuery
 */

import { useCallback } from 'react'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { useNeonwizard } from '@/hooks/useNeonwizard'
import { DISTRICTS } from '@/constants/districts'

// Gender options from Bouwsubsidie constants
const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

const NeonwizardStep2 = () => {
  const { 
    currentStep,
    subStep,
    totalSubSteps,
    selectedService,
    formData, 
    updateFormData, 
    handleValidatedNext,
    handleBack,
    clearError,
    getError,
    getProgress,
    currentSubStepConfig,
  } = useNeonwizard()

  // Handle input change
  const handleChange = useCallback((field: string, value: string | number) => {
    updateFormData({ [field]: value })
    clearError(field)
  }, [updateFormData, clearError])

  // Only render if on step 2
  if (currentStep !== 2) return null

  const progress = getProgress()
  const isBouwsubsidie = selectedService === 'bouwsubsidie'

  // Sub-step 1: Personal Identification
  if (subStep === 1) {
    return (
      <div className="multisteps-form__panel js-active" data-animation="slideHorz">
        <div className="wizard-forms">
          <div className="inner pb-100 clearfix">
            <div className="form-content pera-content">
              <div className="step-inner-content">
                <span className="step-no bottom-line">Step 2.1</span>
                <div className="step-progress float-right">
                  <span>{subStep} of {totalSubSteps} in this section</span>
                  <div className="step-progress-bar">
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>

                <h2>{currentSubStepConfig?.title || 'Personal Identification'}</h2>
                <p>{currentSubStepConfig?.description || 'Please provide your personal details as they appear on your National ID.'}</p>

                <div className="form-inner-area">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">National ID Number *</label>
                      <input
                        type="text"
                        name="national_id"
                        className={`form-control ${getError('national_id') ? 'is-invalid' : ''}`}
                        placeholder="Enter your National ID"
                        value={(formData.national_id as string) || ''}
                        onChange={(e) => handleChange('national_id', e.target.value)}
                      />
                      {getError('national_id') && (
                        <div className="text-danger small mt-1">{getError('national_id')}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        name="full_name"
                        className={`form-control ${getError('full_name') ? 'is-invalid' : ''}`}
                        placeholder="Enter your full name"
                        value={(formData.full_name as string) || ''}
                        onChange={(e) => handleChange('full_name', e.target.value)}
                      />
                      {getError('full_name') && (
                        <div className="text-danger small mt-1">{getError('full_name')}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Date of Birth</label>
                      <input
                        type="date"
                        name="date_of_birth"
                        className="form-control"
                        value={(formData.date_of_birth as string) || ''}
                        onChange={(e) => handleChange('date_of_birth', e.target.value)}
                      />
                      <small className="text-muted">Optional</small>
                    </div>
                    {isBouwsubsidie && (
                      <div className="col-md-6">
                        <label className="form-label">Gender</label>
                        <select
                          name="gender"
                          className="form-select"
                          value={(formData.gender as string) || ''}
                          onChange={(e) => handleChange('gender', e.target.value)}
                        >
                          <option value="">Select gender (optional)</option>
                          {GENDER_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="actions">
            <ul>
              <li>
                <span className="js-btn-prev" title="BACK" onClick={handleBack} style={{ cursor: 'pointer' }}>
                  <IconifyIcon icon="mingcute:arrow-left-line" /> BACK
                </span>
              </li>
              <li>
                <span className="js-btn-next" title="NEXT" onClick={handleValidatedNext} style={{ cursor: 'pointer' }}>
                  NEXT <IconifyIcon icon="mingcute:arrow-right-line" />
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // Sub-step 2: Contact Information
  if (subStep === 2) {
    return (
      <div className="multisteps-form__panel js-active" data-animation="slideHorz">
        <div className="wizard-forms">
          <div className="inner pb-100 clearfix">
            <div className="form-content pera-content">
              <div className="step-inner-content">
                <span className="step-no bottom-line">Step 2.2</span>
                <div className="step-progress float-right">
                  <span>{subStep} of {totalSubSteps} in this section</span>
                  <div className="step-progress-bar">
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>

                <h2>{currentSubStepConfig?.title || 'Contact Information'}</h2>
                <p>{currentSubStepConfig?.description || 'How can we reach you regarding your application?'}</p>

                <div className="form-inner-area">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone_number"
                        className={`form-control ${getError('phone_number') ? 'is-invalid' : ''}`}
                        placeholder="Enter your phone number"
                        value={(formData.phone_number as string) || ''}
                        onChange={(e) => handleChange('phone_number', e.target.value)}
                      />
                      {getError('phone_number') && (
                        <div className="text-danger small mt-1">{getError('phone_number')}</div>
                      )}
                      <small className="text-muted">Required for application updates</small>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        className={`form-control ${getError('email') ? 'is-invalid' : ''}`}
                        placeholder="Enter your email address"
                        value={(formData.email as string) || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                      />
                      {getError('email') && (
                        <div className="text-danger small mt-1">{getError('email')}</div>
                      )}
                      <small className="text-muted">Optional, but recommended</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="actions">
            <ul>
              <li>
                <span className="js-btn-prev" title="BACK" onClick={handleBack} style={{ cursor: 'pointer' }}>
                  <IconifyIcon icon="mingcute:arrow-left-line" /> BACK
                </span>
              </li>
              <li>
                <span className="js-btn-next" title="NEXT" onClick={handleValidatedNext} style={{ cursor: 'pointer' }}>
                  NEXT <IconifyIcon icon="mingcute:arrow-right-line" />
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default NeonwizardStep2

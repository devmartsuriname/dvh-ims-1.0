/**
 * NeonwizardStep5 - Review & Submit (IMS Final Step)
 * Phase 9B-2: IMS Logic Adapter (NO DB)
 * 
 * Bouwsubsidie: Review all data + Declaration + Mock Submit
 * Housing: Review all data + Declaration + Mock Submit
 * 
 * Displays collected IMS form data for review
 * 
 * NO Supabase | NO API calls | NO jQuery
 */

import { useCallback } from 'react'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { useNeonwizard } from '@/hooks/useNeonwizard'
import { DISTRICTS } from '@/constants/districts'

// Helper to get district name from code
const getDistrictName = (code: string): string => {
  const district = DISTRICTS.find(d => d.code === code)
  return district?.name || code
}

// Helper to format labels
const formatLabel = (value: string): string => {
  if (!value) return '-'
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

// Document type interface
interface DocumentItem {
  id: string
  label: string
  hasDocument: boolean
}

const NeonwizardStep5 = () => {
  const { 
    currentStep,
    selectedService,
    formData, 
    updateFormData, 
    handleBack,
    handleSubmit,
    isSubmitted,
    submissionReference,
    resetWizard,
    getProgress,
    getError,
    setError,
    clearError,
  } = useNeonwizard()

  // Handle declaration change
  const handleDeclarationChange = useCallback((checked: boolean) => {
    updateFormData({ declaration_accepted: checked })
    if (checked) {
      clearError('declaration_accepted')
    }
  }, [updateFormData, clearError])

  // Handle form submission
  const onSubmit = useCallback(() => {
    const declarationAccepted = formData.declaration_accepted as boolean
    
    if (!declarationAccepted) {
      setError('declaration_accepted', 'You must accept the declaration to submit')
      return
    }
    
    handleSubmit()
  }, [formData.declaration_accepted, handleSubmit, setError])

  // Only render if on step 5
  if (currentStep !== 5) return null

  const progress = getProgress()
  const isBouwsubsidie = selectedService === 'bouwsubsidie'

  // Show confirmation screen if submitted
  if (isSubmitted && submissionReference) {
    const serviceLabel = isBouwsubsidie ? 'Construction Subsidy' : 'Housing Registration'
    
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

  // BOUWSUBSIDIE Review
  if (isBouwsubsidie) {
    const documents = (formData.documents as DocumentItem[]) || []
    const availableDocs = documents.filter(d => d.hasDocument).length

    return (
      <div className="multisteps-form__panel js-active" data-animation="slideHorz">
        <div className="wizard-forms">
          <div className="inner pb-100 clearfix">
            <div className="form-content pera-content">
              <div className="step-inner-content">
                <span className="step-no bottom-line">Step 5</span>
                <div className="step-progress float-right">
                  <span>Final Review</span>
                  <div className="step-progress-bar">
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>

                <h2>Review Your Application</h2>
                <p>Please review your information before submitting your Construction Subsidy application.</p>

                <div className="form-inner-area">
                  {/* Personal Information */}
                  <div className="review-section mb-4">
                    <h5 className="border-bottom pb-2 mb-3">
                      <IconifyIcon icon="mingcute:user-3-line" className="me-2" />
                      Personal Information
                    </h5>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <small className="text-muted">National ID:</small>
                        <p className="mb-1 fw-medium">{formData.national_id as string || '-'}</p>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted">Full Name:</small>
                        <p className="mb-1 fw-medium">{formData.full_name as string || '-'}</p>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted">Date of Birth:</small>
                        <p className="mb-1 fw-medium">{formData.date_of_birth as string || '-'}</p>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted">Gender:</small>
                        <p className="mb-1 fw-medium">{formatLabel(formData.gender as string)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="review-section mb-4">
                    <h5 className="border-bottom pb-2 mb-3">
                      <IconifyIcon icon="mingcute:phone-line" className="me-2" />
                      Contact Information
                    </h5>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <small className="text-muted">Phone Number:</small>
                        <p className="mb-1 fw-medium">{formData.phone_number as string || '-'}</p>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted">Email:</small>
                        <p className="mb-1 fw-medium">{formData.email as string || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Household & Address */}
                  <div className="review-section mb-4">
                    <h5 className="border-bottom pb-2 mb-3">
                      <IconifyIcon icon="mingcute:home-3-line" className="me-2" />
                      Household & Address
                    </h5>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <small className="text-muted">Household Size:</small>
                        <p className="mb-1 fw-medium">{formData.household_size as number || 1} person(s)</p>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted">Dependents:</small>
                        <p className="mb-1 fw-medium">{formData.dependents as number || 0}</p>
                      </div>
                      <div className="col-12">
                        <small className="text-muted">Address:</small>
                        <p className="mb-1 fw-medium">{formData.address_line as string || '-'}</p>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted">District:</small>
                        <p className="mb-1 fw-medium">{getDistrictName(formData.district as string)}</p>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted">Ressort:</small>
                        <p className="mb-1 fw-medium">{formData.ressort as string || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Application Details */}
                  <div className="review-section mb-4">
                    <h5 className="border-bottom pb-2 mb-3">
                      <IconifyIcon icon="mingcute:file-line" className="me-2" />
                      Application Details
                    </h5>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <small className="text-muted">Reason:</small>
                        <p className="mb-1 fw-medium">{formatLabel(formData.application_reason as string)}</p>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted">Estimated Amount:</small>
                        <p className="mb-1 fw-medium">
                          {formData.estimated_amount ? `SRD ${formData.estimated_amount}` : '-'}
                        </p>
                      </div>
                      <div className="col-12">
                        <small className="text-muted">Emergency Application:</small>
                        <p className="mb-1 fw-medium">
                          {formData.is_calamity ? (
                            <span className="badge bg-warning text-dark">Yes - Calamity</span>
                          ) : 'No'}
                        </p>
                      </div>
                      <div className="col-12">
                        <small className="text-muted">Documents Available:</small>
                        <p className="mb-1 fw-medium">{availableDocs} of {documents.length}</p>
                      </div>
                    </div>
                  </div>

                  {/* Declaration */}
                  <div className="review-section mt-4 p-3 border rounded bg-light">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="declaration_accepted"
                        checked={(formData.declaration_accepted as boolean) || false}
                        onChange={(e) => handleDeclarationChange(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="declaration_accepted">
                        <strong>Declaration</strong>
                        <br />
                        <small className="text-muted">
                          I hereby declare that all information provided is true and accurate to the 
                          best of my knowledge. I understand that providing false information may 
                          result in the rejection of my application and possible legal consequences.
                        </small>
                      </label>
                    </div>
                    {getError('declaration_accepted') && (
                      <div className="text-danger small mt-2">{getError('declaration_accepted')}</div>
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
                <button type="button" className="btn" onClick={onSubmit} style={{ cursor: 'pointer' }}>
                  SUBMIT APPLICATION <IconifyIcon icon="mingcute:check-line" />
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // HOUSING Review
  return (
    <div className="multisteps-form__panel js-active" data-animation="slideHorz">
      <div className="wizard-forms">
        <div className="inner pb-100 clearfix">
          <div className="form-content pera-content">
            <div className="step-inner-content">
              <span className="step-no bottom-line">Step 5</span>
              <div className="step-progress float-right">
                <span>Final Review</span>
                <div className="step-progress-bar">
                  <div className="progress">
                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              </div>

              <h2>Review Your Registration</h2>
              <p>Please review your information before submitting your Housing Registration.</p>

              <div className="form-inner-area">
                {/* Personal Information */}
                <div className="review-section mb-4">
                  <h5 className="border-bottom pb-2 mb-3">
                    <IconifyIcon icon="mingcute:user-3-line" className="me-2" />
                    Personal Information
                  </h5>
                  <div className="row g-2">
                    <div className="col-md-6">
                      <small className="text-muted">National ID:</small>
                      <p className="mb-1 fw-medium">{formData.national_id as string || '-'}</p>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted">Full Name:</small>
                      <p className="mb-1 fw-medium">{formData.full_name as string || '-'}</p>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted">Date of Birth:</small>
                      <p className="mb-1 fw-medium">{formData.date_of_birth as string || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="review-section mb-4">
                  <h5 className="border-bottom pb-2 mb-3">
                    <IconifyIcon icon="mingcute:phone-line" className="me-2" />
                    Contact Information
                  </h5>
                  <div className="row g-2">
                    <div className="col-md-6">
                      <small className="text-muted">Phone Number:</small>
                      <p className="mb-1 fw-medium">{formData.phone_number as string || '-'}</p>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted">Email:</small>
                      <p className="mb-1 fw-medium">{formData.email as string || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Living Situation */}
                <div className="review-section mb-4">
                  <h5 className="border-bottom pb-2 mb-3">
                    <IconifyIcon icon="mingcute:home-3-line" className="me-2" />
                    Current Living Situation
                  </h5>
                  <div className="row g-2">
                    <div className="col-12">
                      <small className="text-muted">Current Address:</small>
                      <p className="mb-1 fw-medium">{formData.current_address as string || '-'}</p>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted">District:</small>
                      <p className="mb-1 fw-medium">{getDistrictName(formData.current_district as string)}</p>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted">Housing Type:</small>
                      <p className="mb-1 fw-medium">{formatLabel(formData.current_housing_type as string)}</p>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted">Monthly Rent:</small>
                      <p className="mb-1 fw-medium">
                        {formData.monthly_rent ? `SRD ${formData.monthly_rent}` : '-'}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted">Number of Residents:</small>
                      <p className="mb-1 fw-medium">{formData.number_of_residents as number || 1}</p>
                    </div>
                  </div>
                </div>

                {/* Housing Preference */}
                <div className="review-section mb-4">
                  <h5 className="border-bottom pb-2 mb-3">
                    <IconifyIcon icon="mingcute:building-1-line" className="me-2" />
                    Housing Preference
                  </h5>
                  <div className="row g-2">
                    <div className="col-md-6">
                      <small className="text-muted">Interest Type:</small>
                      <p className="mb-1 fw-medium">{formatLabel(formData.interest_type as string)}</p>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted">Preferred District:</small>
                      <p className="mb-1 fw-medium">{getDistrictName(formData.preferred_district as string)}</p>
                    </div>
                  </div>
                </div>

                {/* Application Details */}
                <div className="review-section mb-4">
                  <h5 className="border-bottom pb-2 mb-3">
                    <IconifyIcon icon="mingcute:file-line" className="me-2" />
                    Application Details
                  </h5>
                  <div className="row g-2">
                    <div className="col-12">
                      <small className="text-muted">Reason for Application:</small>
                      <p className="mb-1 fw-medium">{formatLabel(formData.application_reason as string)}</p>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted">Income Source:</small>
                      <p className="mb-1 fw-medium">{formatLabel(formData.income_source as string)}</p>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted">Monthly Income:</small>
                      <p className="mb-1 fw-medium">
                        {formData.monthly_income_applicant ? `SRD ${formData.monthly_income_applicant}` : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Urgency */}
                {(formData.has_disability || formData.has_emergency) && (
                  <div className="review-section mb-4">
                    <h5 className="border-bottom pb-2 mb-3">
                      <IconifyIcon icon="mingcute:warning-line" className="me-2" />
                      Special Circumstances
                    </h5>
                    <div className="row g-2">
                      {formData.has_disability && (
                        <div className="col-12">
                          <span className="badge bg-info me-2">Disability/Medical Needs</span>
                        </div>
                      )}
                      {formData.has_emergency && (
                        <div className="col-12">
                          <span className="badge bg-warning text-dark me-2">Emergency Situation</span>
                        </div>
                      )}
                      {formData.urgency_details && (
                        <div className="col-12 mt-2">
                          <small className="text-muted">Details:</small>
                          <p className="mb-1">{formData.urgency_details as string}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Declaration */}
                <div className="review-section mt-4 p-3 border rounded bg-light">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="declaration_accepted"
                      checked={(formData.declaration_accepted as boolean) || false}
                      onChange={(e) => handleDeclarationChange(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="declaration_accepted">
                      <strong>Declaration</strong>
                      <br />
                      <small className="text-muted">
                        I hereby declare that all information provided is true and accurate to the 
                        best of my knowledge. I understand that providing false information may 
                        result in the rejection of my registration and possible legal consequences.
                      </small>
                    </label>
                  </div>
                  {getError('declaration_accepted') && (
                    <div className="text-danger small mt-2">{getError('declaration_accepted')}</div>
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
              <button type="button" className="btn" onClick={onSubmit} style={{ cursor: 'pointer' }}>
                SUBMIT REGISTRATION <IconifyIcon icon="mingcute:check-line" />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default NeonwizardStep5

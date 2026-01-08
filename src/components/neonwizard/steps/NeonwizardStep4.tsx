/**
 * NeonwizardStep4 - Application Details (IMS Steps 5-7)
 * Phase 9B-2: IMS Logic Adapter (NO DB)
 * 
 * Bouwsubsidie: Application Context + Document Declaration
 * Housing: Reason + Income + Urgency
 * 
 * Uses IMS validation schemas via adapter
 * 
 * NO Supabase | NO API calls | NO jQuery
 */

import { useCallback } from 'react'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { useNeonwizard } from '@/hooks/useNeonwizard'

// Bouwsubsidie Application Reasons
const BS_APPLICATION_REASONS = [
  { value: 'new_construction', label: 'New construction' },
  { value: 'renovation', label: 'Home renovation' },
  { value: 'extension', label: 'Home extension' },
  { value: 'repair', label: 'Structural repairs' },
  { value: 'disaster_recovery', label: 'Disaster recovery' },
]

// Housing Application Reasons
const HS_APPLICATION_REASONS = [
  { value: 'no_housing', label: 'Currently without proper housing' },
  { value: 'overcrowding', label: 'Overcrowded living conditions' },
  { value: 'unsafe', label: 'Unsafe or unhealthy housing' },
  { value: 'calamity', label: 'Calamity / disaster affected' },
  { value: 'eviction', label: 'Facing eviction' },
  { value: 'family_growth', label: 'Family growth' },
  { value: 'other', label: 'Other reason' },
]

// Income Sources
const INCOME_SOURCES = [
  { value: 'employment', label: 'Employment' },
  { value: 'self_employed', label: 'Self-employed' },
  { value: 'pension', label: 'Pension' },
  { value: 'social_assistance', label: 'Social assistance' },
  { value: 'unemployment', label: 'Unemployment benefits' },
  { value: 'other', label: 'Other' },
  { value: 'none', label: 'No income' },
]

// Document type interface
interface DocumentItem {
  id: string
  label: string
  hasDocument: boolean
}

const NeonwizardStep4 = () => {
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
  const handleChange = useCallback((field: string, value: string | number | boolean) => {
    updateFormData({ [field]: value })
    clearError(field)
  }, [updateFormData, clearError])

  // Handle document toggle
  const handleDocumentChange = useCallback((documentId: string, hasDocument: boolean) => {
    const documents = (formData.documents as DocumentItem[]) || []
    const updatedDocuments = documents.map((doc) =>
      doc.id === documentId ? { ...doc, hasDocument } : doc
    )
    updateFormData({ documents: updatedDocuments })
  }, [formData.documents, updateFormData])

  // Only render if on step 4
  if (currentStep !== 4) return null

  const progress = getProgress()
  const isBouwsubsidie = selectedService === 'bouwsubsidie'

  // BOUWSUBSIDIE Sub-step 1: Application Context
  if (isBouwsubsidie && subStep === 1) {
    const isCalamity = formData.is_calamity as boolean

    return (
      <div className="multisteps-form__panel js-active" data-animation="slideHorz">
        <div className="wizard-forms">
          <div className="inner pb-100 clearfix">
            <div className="form-content pera-content">
              <div className="step-inner-content">
                <span className="step-no bottom-line">Step 4.1</span>
                <div className="step-progress float-right">
                  <span>{subStep} of {totalSubSteps} in this section</span>
                  <div className="step-progress-bar">
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>

                <h2>{currentSubStepConfig?.title || 'Application Details'}</h2>
                <p>{currentSubStepConfig?.description || 'Tell us more about your construction subsidy request.'}</p>

                <div className="form-inner-area">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Reason for Application *</label>
                      <select
                        name="application_reason"
                        className={`form-select ${getError('application_reason') ? 'is-invalid' : ''}`}
                        value={(formData.application_reason as string) || ''}
                        onChange={(e) => handleChange('application_reason', e.target.value)}
                      >
                        <option value="">Select the reason for your application</option>
                        {BS_APPLICATION_REASONS.map((reason) => (
                          <option key={reason.value} value={reason.value}>
                            {reason.label}
                          </option>
                        ))}
                      </select>
                      {getError('application_reason') && (
                        <div className="text-danger small mt-1">{getError('application_reason')}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Estimated Amount (SRD)</label>
                      <input
                        type="text"
                        name="estimated_amount"
                        className="form-control"
                        placeholder="e.g., 50000"
                        value={(formData.estimated_amount as string) || ''}
                        onChange={(e) => handleChange('estimated_amount', e.target.value)}
                      />
                      <small className="text-muted">Optional - approximate cost of construction</small>
                    </div>
                    <div className="col-12">
                      <div className="border rounded p-3">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="is_calamity"
                            checked={isCalamity || false}
                            onChange={(e) => handleChange('is_calamity', e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="is_calamity">
                            <strong>Calamity/Emergency Application</strong>
                            <br />
                            <small className="text-muted">
                              Check this box if your application is due to a natural disaster, 
                              fire, or other emergency situation
                            </small>
                          </label>
                        </div>
                      </div>
                    </div>
                    {isCalamity && (
                      <div className="col-12">
                        <div className="bg-warning bg-opacity-10 border border-warning rounded p-3">
                          <div className="d-flex align-items-start">
                            <IconifyIcon icon="mingcute:warning-line" className="text-warning fs-4 me-2 mt-1" />
                            <div>
                              <h6 className="fw-semibold mb-1 text-warning">Emergency Application</h6>
                              <p className="text-muted mb-0 small">
                                Emergency applications may be eligible for expedited processing. 
                                Please ensure you have documentation of the emergency situation 
                                available for verification.
                              </p>
                            </div>
                          </div>
                        </div>
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

  // BOUWSUBSIDIE Sub-step 2: Document Declaration
  if (isBouwsubsidie && subStep === 2) {
    const documents = (formData.documents as DocumentItem[]) || []

    return (
      <div className="multisteps-form__panel js-active" data-animation="slideHorz">
        <div className="wizard-forms">
          <div className="inner pb-100 clearfix">
            <div className="form-content pera-content">
              <div className="step-inner-content">
                <span className="step-no bottom-line">Step 4.2</span>
                <div className="step-progress float-right">
                  <span>{subStep} of {totalSubSteps} in this section</span>
                  <div className="step-progress-bar">
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>

                <h2>{currentSubStepConfig?.title || 'Document Declaration'}</h2>
                <p>{currentSubStepConfig?.description || 'Please indicate which required documents you have available.'}</p>

                <div className="form-inner-area">
                  {/* Info Notice */}
                  <div className="bg-light rounded p-3 mb-4">
                    <div className="d-flex align-items-start">
                      <IconifyIcon icon="mingcute:information-line" className="text-primary fs-4 me-2 mt-1" />
                      <div>
                        <h6 className="fw-semibold mb-1">Document Submission</h6>
                        <p className="text-muted mb-0 small">
                          You do not need to upload documents now. This is a declaration of which 
                          documents you have available. You will be required to bring these documents 
                          when you visit the office.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Document Checklist */}
                  <h6 className="fw-semibold mb-3">Required Documents</h6>
                  <div className="d-flex flex-column gap-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="border rounded p-3">
                        <div className="d-flex align-items-start justify-content-between">
                          <div className="d-flex align-items-start flex-grow-1">
                            <div 
                              className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${
                                doc.hasDocument ? 'bg-success bg-opacity-10' : 'bg-secondary bg-opacity-10'
                              }`}
                              style={{ width: 40, height: 40, minWidth: 40 }}
                            >
                              <IconifyIcon 
                                icon={doc.hasDocument ? 'mingcute:check-line' : 'mingcute:document-line'}
                                className={doc.hasDocument ? 'text-success' : 'text-secondary'}
                              />
                            </div>
                            <div>
                              <p className="mb-1 fw-medium">{doc.label}</p>
                              <span className={`badge ${doc.hasDocument ? 'bg-success' : 'bg-secondary'}`}>
                                {doc.hasDocument ? 'Available' : 'Not available'}
                              </span>
                            </div>
                          </div>
                          <div className="form-check form-switch ms-3">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`doc-${doc.id}`}
                              checked={doc.hasDocument}
                              onChange={(e) => handleDocumentChange(doc.id, e.target.checked)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="mt-4 p-3 bg-light rounded">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted">Documents available:</span>
                      <span className="fw-semibold">
                        {documents.filter((d) => d.hasDocument).length} of {documents.length}
                      </span>
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

  // HOUSING Sub-step 1: Reason for Application
  if (!isBouwsubsidie && subStep === 1) {
    return (
      <div className="multisteps-form__panel js-active" data-animation="slideHorz">
        <div className="wizard-forms">
          <div className="inner pb-100 clearfix">
            <div className="form-content pera-content">
              <div className="step-inner-content">
                <span className="step-no bottom-line">Step 4.1</span>
                <div className="step-progress float-right">
                  <span>{subStep} of {totalSubSteps} in this section</span>
                  <div className="step-progress-bar">
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>

                <h2>{currentSubStepConfig?.title || 'Reason for Application'}</h2>
                <p>{currentSubStepConfig?.description || 'Why are you applying for housing registration?'}</p>

                <div className="form-inner-area">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Primary Reason *</label>
                      {HS_APPLICATION_REASONS.map((reason) => (
                        <div className="form-check mb-2" key={reason.value}>
                          <input
                            type="radio"
                            className="form-check-input"
                            id={`reason-${reason.value}`}
                            name="application_reason"
                            value={reason.value}
                            checked={(formData.application_reason as string) === reason.value}
                            onChange={(e) => handleChange('application_reason', e.target.value)}
                          />
                          <label className="form-check-label" htmlFor={`reason-${reason.value}`}>
                            {reason.label}
                          </label>
                        </div>
                      ))}
                      {getError('application_reason') && (
                        <div className="text-danger small mt-1">{getError('application_reason')}</div>
                      )}
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

  // HOUSING Sub-step 2: Income Information
  if (!isBouwsubsidie && subStep === 2) {
    return (
      <div className="multisteps-form__panel js-active" data-animation="slideHorz">
        <div className="wizard-forms">
          <div className="inner pb-100 clearfix">
            <div className="form-content pera-content">
              <div className="step-inner-content">
                <span className="step-no bottom-line">Step 4.2</span>
                <div className="step-progress float-right">
                  <span>{subStep} of {totalSubSteps} in this section</span>
                  <div className="step-progress-bar">
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>

                <h2>{currentSubStepConfig?.title || 'Income Information'}</h2>
                <p>{currentSubStepConfig?.description || 'Please provide information about your income.'}</p>

                <div className="form-inner-area">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Primary Income Source *</label>
                      <select
                        name="income_source"
                        className={`form-select ${getError('income_source') ? 'is-invalid' : ''}`}
                        value={(formData.income_source as string) || ''}
                        onChange={(e) => handleChange('income_source', e.target.value)}
                      >
                        <option value="">Select income source</option>
                        {INCOME_SOURCES.map((source) => (
                          <option key={source.value} value={source.value}>
                            {source.label}
                          </option>
                        ))}
                      </select>
                      {getError('income_source') && (
                        <div className="text-danger small mt-1">{getError('income_source')}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Your Monthly Income (SRD)</label>
                      <input
                        type="text"
                        name="monthly_income_applicant"
                        className="form-control"
                        placeholder="Enter amount"
                        value={(formData.monthly_income_applicant as string) || ''}
                        onChange={(e) => handleChange('monthly_income_applicant', e.target.value)}
                      />
                      <small className="text-muted">Optional</small>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Partner's Monthly Income (SRD)</label>
                      <input
                        type="text"
                        name="monthly_income_partner"
                        className="form-control"
                        placeholder="Enter amount"
                        value={(formData.monthly_income_partner as string) || ''}
                        onChange={(e) => handleChange('monthly_income_partner', e.target.value)}
                      />
                      <small className="text-muted">Optional - if applicable</small>
                    </div>
                  </div>

                  <div className="bg-light rounded p-3 mt-4">
                    <p className="text-muted small mb-0">
                      <strong>Note:</strong> Income information is used to determine eligibility for 
                      different housing programs. You may be asked to provide proof of income later 
                      in the process.
                    </p>
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

  // HOUSING Sub-step 3: Urgency
  if (!isBouwsubsidie && subStep === 3) {
    const hasDisability = formData.has_disability as boolean
    const hasEmergency = formData.has_emergency as boolean

    return (
      <div className="multisteps-form__panel js-active" data-animation="slideHorz">
        <div className="wizard-forms">
          <div className="inner pb-100 clearfix">
            <div className="form-content pera-content">
              <div className="step-inner-content">
                <span className="step-no bottom-line">Step 4.3</span>
                <div className="step-progress float-right">
                  <span>{subStep} of {totalSubSteps} in this section</span>
                  <div className="step-progress-bar">
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>

                <h2>{currentSubStepConfig?.title || 'Special Needs & Urgency'}</h2>
                <p>{currentSubStepConfig?.description || 'Do you have any special circumstances that require urgent attention?'}</p>

                <div className="form-inner-area">
                  {/* Info Notice */}
                  <div className="bg-light rounded p-3 mb-4">
                    <div className="d-flex align-items-start">
                      <IconifyIcon icon="mingcute:information-line" className="text-primary fs-4 me-2 mt-1" />
                      <div>
                        <p className="text-muted mb-0 small">
                          Special circumstances may affect your position on the waiting list. 
                          Please provide accurate information. Documentation may be required 
                          for verification.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="has_disability"
                          checked={hasDisability || false}
                          onChange={(e) => handleChange('has_disability', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="has_disability">
                          <strong>Disability or Special Medical Needs</strong>
                          <br />
                          <small className="text-muted">
                            You or a household member has a disability or medical condition 
                            requiring specific housing accommodations.
                          </small>
                        </label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="has_emergency"
                          checked={hasEmergency || false}
                          onChange={(e) => handleChange('has_emergency', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="has_emergency">
                          <strong>Emergency / Urgent Situation</strong>
                          <br />
                          <small className="text-muted">
                            You are facing an emergency situation such as homelessness, 
                            displacement due to calamity, or imminent eviction.
                          </small>
                        </label>
                      </div>
                    </div>
                    {(hasDisability || hasEmergency) && (
                      <div className="col-12 mt-3">
                        <label className="form-label">Please provide details about your situation</label>
                        <textarea
                          className="form-control"
                          rows={4}
                          name="urgency_details"
                          value={(formData.urgency_details as string) || ''}
                          onChange={(e) => handleChange('urgency_details', e.target.value)}
                          placeholder="Describe your special circumstances..."
                        />
                        <small className="text-muted">
                          This information will be reviewed to assess urgency priority.
                        </small>
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

  return null
}

export default NeonwizardStep4

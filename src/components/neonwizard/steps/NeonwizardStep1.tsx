/**
 * NeonwizardStep1 - Service Selection
 * Phase 9B-1: Interactive with state management
 * 
 * Features:
 * - Service selection (radio buttons)
 * - Updates context on selection
 * - Next button enabled when service selected
 * - Status selection navigates to /status
 * 
 * NO Supabase | NO API calls | NO jQuery
 */

import { useCallback, useEffect } from 'react'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { useNeonwizard } from '@/hooks/useNeonwizard'

const NeonwizardStep1 = () => {
  const { 
    formData, 
    updateFormData, 
    handleServiceSelection,
    getError,
    clearError,
  } = useNeonwizard()

  const selectedService = formData.service_name as string | undefined

  // Handle radio change
  const handleChange = useCallback((value: string) => {
    updateFormData({ service_name: value })
    clearError('service_name')
  }, [updateFormData, clearError])

  // Handle Next button click
  const handleNext = useCallback(() => {
    if (!selectedService) return

    // Map service name to service type
    if (selectedService === 'Corporate Services') {
      handleServiceSelection('bouwsubsidie')
    } else if (selectedService === 'Freelancing Services') {
      handleServiceSelection('housing')
    } else if (selectedService === 'Development Services') {
      handleServiceSelection('status')
    }
  }, [selectedService, handleServiceSelection])

  // Set default selection on mount if none selected
  useEffect(() => {
    if (!selectedService) {
      updateFormData({ service_name: 'Corporate Services' })
    }
  }, [])

  const error = getError('service_name')
  const isNextDisabled = !selectedService

  return (
    <div className="multisteps-form__panel js-active" data-animation="slideHorz">
      <div className="wizard-forms">
        <div className="inner pb-100 clearfix">
          <div className="form-content pera-content">
            <div className="step-inner-content">
              <span className="step-no">Step 1</span>
              <h2>What kind of Services You need?</h2>
              <p>
                Select the type of service you wish to apply for. You can apply for 
                a construction subsidy, register for housing, or check the status 
                of an existing application.
              </p>
              <div className="step-box">
                <div className="row">
                  <div className="col-md-4">
                    <label 
                      className={`step-box-content bg-white text-center relative-position ${selectedService === 'Corporate Services' ? 'active' : ''}`}
                    >
                      <span className="step-box-icon">
                        <img src="/assets/neonwizard/img/d1.png" alt="" />
                      </span>
                      <span className="step-box-text">Construction Subsidy</span>
                      <span className="service-check-option">
                        <span>
                          <input
                            type="radio"
                            name="service_name"
                            value="Corporate Services"
                            checked={selectedService === 'Corporate Services'}
                            onChange={(e) => handleChange(e.target.value)}
                          />
                        </span>
                      </span>
                    </label>
                  </div>
                  <div className="col-md-4">
                    <label 
                      className={`step-box-content bg-white text-center relative-position ${selectedService === 'Freelancing Services' ? 'active' : ''}`}
                    >
                      <span className="step-box-icon">
                        <img src="/assets/neonwizard/img/d2.png" alt="" />
                      </span>
                      <span className="step-box-text">Housing Registration</span>
                      <span className="service-check-option">
                        <span>
                          <input
                            type="radio"
                            name="service_name"
                            value="Freelancing Services"
                            checked={selectedService === 'Freelancing Services'}
                            onChange={(e) => handleChange(e.target.value)}
                          />
                        </span>
                      </span>
                    </label>
                  </div>
                  <div className="col-md-4">
                    <label 
                      className={`step-box-content bg-white text-center relative-position ${selectedService === 'Development Services' ? 'active' : ''}`}
                    >
                      <span className="step-box-icon">
                        <img src="/assets/neonwizard/img/d3.png" alt="" />
                      </span>
                      <span className="step-box-text">Check Status</span>
                      <span className="service-check-option">
                        <span>
                          <input
                            type="radio"
                            name="service_name"
                            value="Development Services"
                            checked={selectedService === 'Development Services'}
                            onChange={(e) => handleChange(e.target.value)}
                          />
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
                {error && (
                  <div className="text-danger mt-2 text-center">{error}</div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="actions">
          <ul>
            <li className="disable" aria-disabled="true">
              <span className="js-btn-next" title="NEXT">
                Backward <IconifyIcon icon="mingcute:arrow-right-line" />
              </span>
            </li>
            <li>
              <span 
                className={`js-btn-next ${isNextDisabled ? 'disabled' : ''}`} 
                title="NEXT"
                onClick={handleNext}
                style={{ cursor: isNextDisabled ? 'not-allowed' : 'pointer', opacity: isNextDisabled ? 0.5 : 1 }}
              >
                NEXT <IconifyIcon icon="mingcute:arrow-right-line" />
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default NeonwizardStep1

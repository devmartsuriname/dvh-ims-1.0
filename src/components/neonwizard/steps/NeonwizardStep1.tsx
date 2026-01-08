/**
 * NeonwizardStep1 - Service Selection
 * Phase 9B-2: IMS Logic Adapter (NO DB)
 * 
 * Features:
 * - Service type selection (bouwsubsidie / housing / status)
 * - Navigation to selected service flow
 * - Initializes IMS form data on service selection
 * 
 * NO Supabase | NO API calls | NO jQuery
 */

import { useCallback } from 'react'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { useNeonwizard } from '@/hooks/useNeonwizard'
import type { ServiceType } from '@/context/NeonwizardContext'

const NeonwizardStep1 = () => {
  const { 
    currentStep,
    selectedService,
    selectService,
    handleServiceSelection,
    getError,
    setError,
    clearAllErrors,
  } = useNeonwizard()

  // Handle service card click
  const handleServiceClick = useCallback((service: ServiceType) => {
    clearAllErrors()
    selectService(service)
  }, [selectService, clearAllErrors])

  // Handle Next button
  const handleNext = useCallback(() => {
    if (!selectedService) {
      setError('service', 'Please select a service to continue')
      return
    }
    handleServiceSelection(selectedService)
  }, [selectedService, handleServiceSelection, setError])

  // Only render if on step 1
  if (currentStep !== 1) return null

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
                      className={`step-box-content bg-white text-center relative-position ${selectedService === 'bouwsubsidie' ? 'active' : ''}`}
                      onClick={() => handleServiceClick('bouwsubsidie')}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="step-box-icon">
                        <IconifyIcon icon="mingcute:building-4-line" style={{ fontSize: '48px' }} />
                      </span>
                      <span className="step-box-text">Construction Subsidy</span>
                      <span className="service-check-option">
                        <span>
                          <input
                            type="radio"
                            name="service_selection"
                            value="bouwsubsidie"
                            checked={selectedService === 'bouwsubsidie'}
                            onChange={() => handleServiceClick('bouwsubsidie')}
                          />
                        </span>
                      </span>
                    </label>
                  </div>
                  <div className="col-md-4">
                    <label 
                      className={`step-box-content bg-white text-center relative-position ${selectedService === 'housing' ? 'active' : ''}`}
                      onClick={() => handleServiceClick('housing')}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="step-box-icon">
                        <IconifyIcon icon="mingcute:home-3-line" style={{ fontSize: '48px' }} />
                      </span>
                      <span className="step-box-text">Housing Registration</span>
                      <span className="service-check-option">
                        <span>
                          <input
                            type="radio"
                            name="service_selection"
                            value="housing"
                            checked={selectedService === 'housing'}
                            onChange={() => handleServiceClick('housing')}
                          />
                        </span>
                      </span>
                    </label>
                  </div>
                  <div className="col-md-4">
                    <label 
                      className={`step-box-content bg-white text-center relative-position ${selectedService === 'status' ? 'active' : ''}`}
                      onClick={() => handleServiceClick('status')}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="step-box-icon">
                        <IconifyIcon icon="mingcute:search-2-line" style={{ fontSize: '48px' }} />
                      </span>
                      <span className="step-box-text">Check Status</span>
                      <span className="service-check-option">
                        <span>
                          <input
                            type="radio"
                            name="service_selection"
                            value="status"
                            checked={selectedService === 'status'}
                            onChange={() => handleServiceClick('status')}
                          />
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
                {getError('service') && (
                  <div className="text-danger mt-2 text-center">{getError('service')}</div>
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
                className="js-btn-next" 
                title="NEXT"
                onClick={handleNext}
                style={{ cursor: 'pointer' }}
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

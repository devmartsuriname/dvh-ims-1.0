/**
 * NeonwizardStep3 - Household/Housing Details (IMS Steps 3-4)
 * Phase 9B-2: IMS Logic Adapter (NO DB)
 * 
 * Bouwsubsidie: Household Info + Address
 * Housing: Living Situation + Housing Preference
 * 
 * Uses IMS validation schemas via adapter
 * 
 * NO Supabase | NO API calls | NO jQuery
 */

import { useCallback } from 'react'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { useNeonwizard } from '@/hooks/useNeonwizard'
import { DISTRICTS } from '@/constants/districts'

// Housing type options
const HOUSING_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'room', label: 'Room' },
  { value: 'shared', label: 'Shared accommodation' },
  { value: 'other', label: 'Other' },
]

// Interest type options
const INTEREST_TYPES = [
  { value: 'rent', label: 'Rent' },
  { value: 'rent_to_own', label: 'Rent-to-own' },
  { value: 'purchase', label: 'Purchase' },
]

const NeonwizardStep3 = () => {
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

  // Only render if on step 3
  if (currentStep !== 3) return null

  const progress = getProgress()
  const isBouwsubsidie = selectedService === 'bouwsubsidie'

  // BOUWSUBSIDIE Sub-step 1: Household Information
  if (isBouwsubsidie && subStep === 1) {
    return (
      <div className="multisteps-form__panel js-active" data-animation="slideHorz">
        <div className="wizard-forms">
          <div className="inner pb-100 clearfix">
            <div className="form-content pera-content">
              <div className="step-inner-content">
                <span className="step-no bottom-line">Step 3.1</span>
                <div className="step-progress float-right">
                  <span>{subStep} of {totalSubSteps} in this section</span>
                  <div className="step-progress-bar">
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>

                <h2>{currentSubStepConfig?.title || 'Household Information'}</h2>
                <p>{currentSubStepConfig?.description || 'Tell us about your household composition.'}</p>

                <div className="form-inner-area">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Household Size *</label>
                      <input
                        type="number"
                        name="household_size"
                        className={`form-control ${getError('household_size') ? 'is-invalid' : ''}`}
                        min={1}
                        max={20}
                        placeholder="Total number of people"
                        value={(formData.household_size as number) || 1}
                        onChange={(e) => handleChange('household_size', parseInt(e.target.value) || 1)}
                      />
                      {getError('household_size') && (
                        <div className="text-danger small mt-1">{getError('household_size')}</div>
                      )}
                      <small className="text-muted">Including yourself</small>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Number of Dependents</label>
                      <input
                        type="number"
                        name="dependents"
                        className={`form-control ${getError('dependents') ? 'is-invalid' : ''}`}
                        min={0}
                        max={20}
                        placeholder="Number of dependents"
                        value={(formData.dependents as number) || 0}
                        onChange={(e) => handleChange('dependents', parseInt(e.target.value) || 0)}
                      />
                      {getError('dependents') && (
                        <div className="text-danger small mt-1">{getError('dependents')}</div>
                      )}
                      <small className="text-muted">Children or others who depend on you financially (optional)</small>
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

  // BOUWSUBSIDIE Sub-step 2: Address
  if (isBouwsubsidie && subStep === 2) {
    return (
      <div className="multisteps-form__panel js-active" data-animation="slideHorz">
        <div className="wizard-forms">
          <div className="inner pb-100 clearfix">
            <div className="form-content pera-content">
              <div className="step-inner-content">
                <span className="step-no bottom-line">Step 3.2</span>
                <div className="step-progress float-right">
                  <span>{subStep} of {totalSubSteps} in this section</span>
                  <div className="step-progress-bar">
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>

                <h2>{currentSubStepConfig?.title || 'Current Address'}</h2>
                <p>{currentSubStepConfig?.description || 'Where do you currently reside?'}</p>

                <div className="form-inner-area">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Street Address *</label>
                      <input
                        type="text"
                        name="address_line"
                        className={`form-control ${getError('address_line') ? 'is-invalid' : ''}`}
                        placeholder="Enter your street address"
                        value={(formData.address_line as string) || ''}
                        onChange={(e) => handleChange('address_line', e.target.value)}
                      />
                      {getError('address_line') && (
                        <div className="text-danger small mt-1">{getError('address_line')}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">District *</label>
                      <select
                        name="district"
                        className={`form-select ${getError('district') ? 'is-invalid' : ''}`}
                        value={(formData.district as string) || ''}
                        onChange={(e) => handleChange('district', e.target.value)}
                      >
                        <option value="">Select your district</option>
                        {DISTRICTS.map((district) => (
                          <option key={district.code} value={district.code}>
                            {district.name}
                          </option>
                        ))}
                      </select>
                      {getError('district') && (
                        <div className="text-danger small mt-1">{getError('district')}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Ressort</label>
                      <input
                        type="text"
                        name="ressort"
                        className="form-control"
                        placeholder="Enter your ressort"
                        value={(formData.ressort as string) || ''}
                        onChange={(e) => handleChange('ressort', e.target.value)}
                      />
                      <small className="text-muted">Optional</small>
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

  // HOUSING Sub-step 1: Living Situation
  if (!isBouwsubsidie && subStep === 1) {
    return (
      <div className="multisteps-form__panel js-active" data-animation="slideHorz">
        <div className="wizard-forms">
          <div className="inner pb-100 clearfix">
            <div className="form-content pera-content">
              <div className="step-inner-content">
                <span className="step-no bottom-line">Step 3.1</span>
                <div className="step-progress float-right">
                  <span>{subStep} of {totalSubSteps} in this section</span>
                  <div className="step-progress-bar">
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>

                <h2>{currentSubStepConfig?.title || 'Current Living Situation'}</h2>
                <p>{currentSubStepConfig?.description || 'Tell us about where you currently live.'}</p>

                <div className="form-inner-area">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Current Address *</label>
                      <input
                        type="text"
                        name="current_address"
                        className={`form-control ${getError('current_address') ? 'is-invalid' : ''}`}
                        placeholder="Enter your current address"
                        value={(formData.current_address as string) || ''}
                        onChange={(e) => handleChange('current_address', e.target.value)}
                      />
                      {getError('current_address') && (
                        <div className="text-danger small mt-1">{getError('current_address')}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">District *</label>
                      <select
                        name="current_district"
                        className={`form-select ${getError('current_district') ? 'is-invalid' : ''}`}
                        value={(formData.current_district as string) || ''}
                        onChange={(e) => handleChange('current_district', e.target.value)}
                      >
                        <option value="">Select your district</option>
                        {DISTRICTS.map((district) => (
                          <option key={district.code} value={district.code}>
                            {district.name}
                          </option>
                        ))}
                      </select>
                      {getError('current_district') && (
                        <div className="text-danger small mt-1">{getError('current_district')}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Housing Type *</label>
                      <select
                        name="current_housing_type"
                        className={`form-select ${getError('current_housing_type') ? 'is-invalid' : ''}`}
                        value={(formData.current_housing_type as string) || ''}
                        onChange={(e) => handleChange('current_housing_type', e.target.value)}
                      >
                        <option value="">Select housing type</option>
                        {HOUSING_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {getError('current_housing_type') && (
                        <div className="text-danger small mt-1">{getError('current_housing_type')}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Monthly Rent (SRD)</label>
                      <input
                        type="text"
                        name="monthly_rent"
                        className="form-control"
                        placeholder="Enter amount"
                        value={(formData.monthly_rent as string) || ''}
                        onChange={(e) => handleChange('monthly_rent', e.target.value)}
                      />
                      <small className="text-muted">Optional - if renting</small>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Number of Residents *</label>
                      <input
                        type="number"
                        name="number_of_residents"
                        className={`form-control ${getError('number_of_residents') ? 'is-invalid' : ''}`}
                        min={1}
                        value={(formData.number_of_residents as number) || 1}
                        onChange={(e) => handleChange('number_of_residents', parseInt(e.target.value) || 1)}
                      />
                      {getError('number_of_residents') && (
                        <div className="text-danger small mt-1">{getError('number_of_residents')}</div>
                      )}
                      <small className="text-muted">Including yourself</small>
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

  // HOUSING Sub-step 2: Housing Preference
  if (!isBouwsubsidie && subStep === 2) {
    return (
      <div className="multisteps-form__panel js-active" data-animation="slideHorz">
        <div className="wizard-forms">
          <div className="inner pb-100 clearfix">
            <div className="form-content pera-content">
              <div className="step-inner-content">
                <span className="step-no bottom-line">Step 3.2</span>
                <div className="step-progress float-right">
                  <span>{subStep} of {totalSubSteps} in this section</span>
                  <div className="step-progress-bar">
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>

                <h2>{currentSubStepConfig?.title || 'Housing Preference'}</h2>
                <p>{currentSubStepConfig?.description || 'What type of housing are you interested in?'}</p>

                <div className="form-inner-area">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Interest Type *</label>
                      <select
                        name="interest_type"
                        className={`form-select ${getError('interest_type') ? 'is-invalid' : ''}`}
                        value={(formData.interest_type as string) || ''}
                        onChange={(e) => handleChange('interest_type', e.target.value)}
                      >
                        <option value="">Select interest type</option>
                        {INTEREST_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {getError('interest_type') && (
                        <div className="text-danger small mt-1">{getError('interest_type')}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Preferred District *</label>
                      <select
                        name="preferred_district"
                        className={`form-select ${getError('preferred_district') ? 'is-invalid' : ''}`}
                        value={(formData.preferred_district as string) || ''}
                        onChange={(e) => handleChange('preferred_district', e.target.value)}
                      >
                        <option value="">Select preferred district</option>
                        {DISTRICTS.map((district) => (
                          <option key={district.code} value={district.code}>
                            {district.name}
                          </option>
                        ))}
                      </select>
                      {getError('preferred_district') && (
                        <div className="text-danger small mt-1">{getError('preferred_district')}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-light rounded p-3 mt-4">
                    <p className="text-muted small mb-0">
                      <strong>Note:</strong> Your preferred district is used for allocation 
                      prioritization. Final allocation may be in a different district based on availability.
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

  return null
}

export default NeonwizardStep3

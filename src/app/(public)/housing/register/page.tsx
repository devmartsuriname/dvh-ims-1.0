import { useState } from 'react'
import { Container, Card } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/integrations/supabase/client'
import PublicHeader from '@/components/public/PublicHeader'
import PublicFooter from '@/components/public/PublicFooter'
import WizardProgress, { type WizardStep } from '@/components/public/WizardProgress'
import { HousingFormData, SubmissionResult } from './types'
import { WIZARD_STEPS, INITIAL_FORM_DATA } from './constants'

import Step0Introduction from './steps/Step0Introduction'
import Step1PersonalInfo from './steps/Step1PersonalInfo'
import Step2ContactInfo from './steps/Step2ContactInfo'
import Step3LivingSituation from './steps/Step3LivingSituation'
import Step4HousingPreference from './steps/Step4HousingPreference'
import Step5Reason from './steps/Step5Reason'
import Step6Income from './steps/Step6Income'
import Step7Urgency from './steps/Step7Urgency'
import Step8Documents from './steps/Step8Documents'
import Step9Review from './steps/Step9Review'
import Step10Receipt from './steps/Step10Receipt'

/**
 * Housing Registration Public Wizard
 * Phase 5C - Document Upload Implementation
 * 
 * 11-step wizard for Housing Registration applications
 * Uses react-bootstrap components per Darkone 1:1 standard
 * i18n enabled - NL default
 */
const HousingRegistrationWizard = () => {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<HousingFormData>(INITIAL_FORM_DATA)
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Convert wizard steps with translation keys to translated titles
  const progressSteps: WizardStep[] = WIZARD_STEPS.map(step => ({ 
    title: t(step.titleKey) 
  }))

  const handleNext = () => {
    if (currentStep === 9) {
      // Step 9 (Review) triggers submission
      handleSubmit()
    } else {
      setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.length - 1))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const updateFormData = (data: Partial<HousingFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  /**
   * Maps technical errors to citizen-safe messages
   * No internal error details are exposed to users
   */
  const getSafeErrorMessage = (response: any, error: any): string => {
    // Network/offline detection
    if (!navigator.onLine || error?.message?.toLowerCase().includes('fetch')) {
      return t('errors.networkError')
    }
    
    const status = response?.error?.status
    const errorStr = response?.data?.error || response?.error?.message || ''
    
    // Rate limiting
    if (status === 429 || errorStr.toLowerCase().includes('too many')) {
      return t('errors.rateLimited')
    }
    
    // Validation errors
    if (status === 400 || errorStr.toLowerCase().includes('validation')) {
      return t('errors.validationError')
    }
    
    // Server errors
    if (status >= 500) {
      return t('errors.serverError')
    }
    
    // Generic fallback
    return t('errors.submissionFailed')
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    let response: any = null
    
    try {
      response = await supabase.functions.invoke('submit-housing-registration', {
        body: formData
      })
      
      if (response.error) throw new Error('submission_failed')
      if (!response.data?.success) throw new Error('submission_failed')
      
      setSubmissionResult({
        reference_number: response.data.reference_number,
        access_token: response.data.access_token,
        submitted_at: response.data.submitted_at
      })
      setCurrentStep(10)
      
      // Clear session storage after successful submission
      sessionStorage.removeItem('housing_session_id')
    } catch (error: any) {
      toast.error(getSafeErrorMessage(response, error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    const commonProps = {
      formData,
      updateFormData,
      onNext: handleNext,
      onBack: handleBack
    }

    switch (currentStep) {
      case 0:
        return <Step0Introduction onNext={handleNext} />
      case 1:
        return <Step1PersonalInfo {...commonProps} />
      case 2:
        return <Step2ContactInfo {...commonProps} />
      case 3:
        return <Step3LivingSituation {...commonProps} />
      case 4:
        return <Step4HousingPreference {...commonProps} />
      case 5:
        return <Step5Reason {...commonProps} />
      case 6:
        return <Step6Income {...commonProps} />
      case 7:
        return <Step7Urgency {...commonProps} />
      case 8:
        return <Step8Documents {...commonProps} />
      case 9:
        return (
          <Step9Review 
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        )
      case 10:
        return <Step10Receipt result={submissionResult!} />
      default:
        return null
    }
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <PublicHeader />
      
      <main className="flex-grow-1 py-4 bg-light">
        <Container style={{ maxWidth: 860 }}>
          {/* Progress indicator - hide on receipt step */}
          {currentStep < 10 && (
            <WizardProgress 
              steps={progressSteps} 
              currentStep={currentStep} 
            />
          )}
          
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              {renderStep()}
            </Card.Body>
          </Card>
        </Container>
      </main>
      
      <PublicFooter />
    </div>
  )
}

export default HousingRegistrationWizard

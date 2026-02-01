import { useState } from 'react'
import { Container, Card } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/integrations/supabase/client'
import PublicHeader from '@/components/public/PublicHeader'
import PublicFooter from '@/components/public/PublicFooter'
import WizardProgress, { type WizardStep } from '@/components/public/WizardProgress'
import { BouwsubsidieFormData, SubmissionResult } from './types'
import { WIZARD_STEPS, INITIAL_FORM_DATA } from './constants'

import Step0Introduction from './steps/Step0Introduction'
import Step1PersonalInfo from './steps/Step1PersonalInfo'
import Step2ContactInfo from './steps/Step2ContactInfo'
import Step3Household from './steps/Step3Household'
import Step4Address from './steps/Step4Address'
import Step5Context from './steps/Step5Context'
import Step6Documents from './steps/Step6Documents'
import Step7Review from './steps/Step7Review'
import Step8Receipt from './steps/Step8Receipt'

/**
 * Bouwsubsidie Public Wizard
 * V1.3 Phase 5A — Public Wizard with i18n + Document Upload
 * 
 * Multi-step wizard for Construction Subsidy applications
 * Uses react-bootstrap components per Darkone 1:1 standard
 */
const BouwsubsidieWizard = () => {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<BouwsubsidieFormData>(INITIAL_FORM_DATA)
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Translate wizard steps for progress indicator
  const progressSteps: WizardStep[] = WIZARD_STEPS.map(step => ({ title: t(step.titleKey) }))

  const handleNext = () => {
    if (currentStep === 7) {
      // Step 7 triggers submission
      handleSubmit()
    } else {
      setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.length - 1))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const updateFormData = (data: Partial<BouwsubsidieFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  /**
   * Maps technical errors to citizen-safe messages (translated)
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
      response = await supabase.functions.invoke('submit-bouwsubsidie-application', {
        body: formData
      })
      
      if (response.error) throw new Error('submission_failed')
      if (!response.data?.success) throw new Error('submission_failed')
      
      setSubmissionResult({
        reference_number: response.data.reference_number,
        access_token: response.data.access_token,
        submitted_at: response.data.submitted_at
      })
      setCurrentStep(8)
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
        return <Step3Household {...commonProps} />
      case 4:
        return <Step4Address {...commonProps} />
      case 5:
        return <Step5Context {...commonProps} />
      case 6:
        return <Step6Documents {...commonProps} />
      case 7:
        return (
          <Step7Review 
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        )
      case 8:
        return <Step8Receipt result={submissionResult} />
      default:
        return null
    }
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <PublicHeader />
      
      <main className="flex-grow-1 py-4 bg-light">
        <Container style={{ maxWidth: 800 }}>
          {/* Progress indicator - hide on receipt step */}
          {currentStep < 8 && (
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

export default BouwsubsidieWizard

import { useState } from 'react'
import { Container, Card } from 'react-bootstrap'
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
 * Phase 5 - Checkpoint 4
 * 
 * Multi-step wizard for Construction Subsidy applications
 * Uses react-bootstrap components per Darkone 1:1 standard
 */
const BouwsubsidieWizard = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<BouwsubsidieFormData>(INITIAL_FORM_DATA)
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cast readonly array to mutable for WizardProgress compatibility
  const progressSteps: WizardStep[] = WIZARD_STEPS.map(step => ({ title: step.title }))

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

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    // Mock submission delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Generate mock reference number and token
    const referenceNumber = `BS-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`
    const accessToken = crypto.randomUUID().slice(0, 12).toUpperCase()
    
    setSubmissionResult({
      reference_number: referenceNumber,
      access_token: accessToken,
      submitted_at: new Date().toISOString()
    })
    
    setCurrentStep(8)
    setIsSubmitting(false)
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

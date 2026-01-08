import { ReactNode } from 'react'
import bgImage from '@/assets/images/neonwizard/bg.jpg'
import NeonwizardProgress from './NeonwizardProgress'

export interface NeonwizardStep {
  title: string
  subtitle?: string
}

interface NeonwizardLayoutProps {
  children: ReactNode
  steps: NeonwizardStep[]
  currentStep: number
  onBack?: () => void
  onNext?: () => void
  isSubmitting?: boolean
  isLastStep?: boolean
  showActions?: boolean
  backLabel?: string
  nextLabel?: string
}

/**
 * NeonwizardLayout - Layout #1 Full Width
 * Phase 8.5 - Two-column wizard layout
 * 
 * Left panel: 30% width with background image + vertical step progress
 * Right panel: 70% width for form content
 */
const NeonwizardLayout = ({
  children,
  steps,
  currentStep,
  onBack,
  onNext,
  isSubmitting = false,
  isLastStep = false,
  showActions = true,
  backLabel = 'Back',
  nextLabel = 'Next'
}: NeonwizardLayoutProps) => {
  const showBackButton = currentStep > 0 && onBack
  
  return (
    <div className="nw-wrapper">
      {/* Left Panel - Steps Area */}
      <div 
        className="nw-steps-area"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="nw-steps-content">
          <NeonwizardProgress 
            steps={steps} 
            currentStep={currentStep} 
          />
        </div>
      </div>
      
      {/* Right Panel - Content Area */}
      <div className="nw-content-area">
        <div className="nw-form-area">
          <div className="nw-step-content">
            {children}
          </div>
        </div>
        
        {/* Actions Footer */}
        {showActions && (
          <div className="nw-actions">
            {showBackButton && (
              <button 
                type="button"
                className="nw-btn-prev"
                onClick={onBack}
                disabled={isSubmitting}
              >
                <span className="nw-btn-icon">←</span>
                {backLabel}
              </button>
            )}
            
            {onNext && (
              <button 
                type="button"
                className={isLastStep ? 'nw-btn-submit' : 'nw-btn-next'}
                onClick={onNext}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  'Processing...'
                ) : (
                  <>
                    {nextLabel}
                    {!isLastStep && <span className="nw-btn-icon">→</span>}
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default NeonwizardLayout

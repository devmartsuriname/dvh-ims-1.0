import { Card, CardBody, Button, Spinner } from 'react-bootstrap'
import IconifyIcon from '@/components/wrapper/IconifyIcon'

interface WizardStepProps {
  title: string
  description?: string
  children: React.ReactNode
  onBack?: () => void
  onNext?: () => void
  isFirstStep?: boolean
  isLastStep?: boolean
  isSubmitting?: boolean
  nextLabel?: string
  backLabel?: string
  nextDisabled?: boolean
}

/**
 * WizardStep - Wrapper component for wizard step content
 * 
 * Darkone 1:1 with react-bootstrap
 * Provides navigation buttons and step container
 */
const WizardStep = ({
  title,
  description,
  children,
  onBack,
  onNext,
  isFirstStep = false,
  isLastStep = false,
  isSubmitting = false,
  nextLabel,
  backLabel = 'Back',
  nextDisabled = false,
}: WizardStepProps) => {
  const getNextLabel = () => {
    if (nextLabel) return nextLabel
    if (isLastStep) return 'Submit Application'
    return 'Continue'
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardBody className="p-4">
        {/* Step Header */}
        <div className="mb-4">
          <h4 className="fw-bold mb-1">{title}</h4>
          {description && (
            <p className="text-muted mb-0">{description}</p>
          )}
        </div>

        {/* Step Content */}
        <div className="mb-4">
          {children}
        </div>

        {/* Navigation */}
        <div className="d-flex justify-content-between align-items-center pt-3 border-top">
          <div>
            {!isFirstStep && (
              <Button 
                variant="outline-secondary" 
                onClick={onBack}
                disabled={isSubmitting}
              >
                <IconifyIcon icon="mingcute:arrow-left-line" className="me-1" />
                {backLabel}
              </Button>
            )}
          </div>
          <div>
            <Button 
              variant="primary" 
              onClick={onNext}
              disabled={isSubmitting || nextDisabled}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Processing...
                </>
              ) : (
                <>
                  {getNextLabel()}
                  {!isLastStep && (
                    <IconifyIcon icon="mingcute:arrow-right-line" className="ms-1" />
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export default WizardStep

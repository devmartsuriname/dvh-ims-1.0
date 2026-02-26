import { Card, CardBody, Button, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
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
 * V1.3 Phase 5A — Localized with i18n
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
  backLabel,
  nextDisabled = false,
}: WizardStepProps) => {
  const { t } = useTranslation()

  const getNextLabel = () => {
    if (nextLabel) return nextLabel
    if (isLastStep) return t('common.submitApplication')
    return t('common.continue')
  }

  const getBackLabel = () => {
    if (backLabel) return backLabel
    return t('common.back')
  }

  return (
    <Card className="border-0 shadow-none">
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
                {getBackLabel()}
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
                  {t('common.processing')}
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

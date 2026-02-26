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
 * V1.7 — Mobile-first with sticky bottom navigation
 * 
 * Mobile (<768px): Sticky bottom nav bar, inline nav hidden
 * Desktop (>=768px): Standard inline navigation bar
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

  const NavigationButtons = ({ className = '' }: { className?: string }) => (
    <div className={`d-flex justify-content-between align-items-center ${className}`}>
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
  )

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

        {/* Step Content — extra bottom padding on mobile for sticky nav */}
        <div className="mb-4 pb-md-0" style={{ paddingBottom: 72 }}>
          {children}
        </div>

        {/* Desktop Navigation (>=768px) */}
        <NavigationButtons className="pt-3 border-top d-none d-md-flex" />
      </CardBody>

      {/* Mobile Sticky Bottom Navigation (<768px) */}
      <div
        className="d-block d-md-none bg-white border-top"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1020,
          padding: '12px 16px',
        }}
      >
        <NavigationButtons />
      </div>
    </Card>
  )
}

export default WizardStep

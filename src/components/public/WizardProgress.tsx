import { Row, Col, ProgressBar } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import IconifyIcon from '@/components/wrapper/IconifyIcon'

export interface WizardStep {
  title: string
}

interface WizardProgressProps {
  steps: WizardStep[]
  currentStep: number
}

/**
 * WizardProgress - Responsive step indicator for multi-step wizards
 * V1.6 — Layout Standardization
 * 
 * Desktop (>=768px): 32px circles with 2-line labels
 * Tablet (576-767px): 28px circles, no labels
 * Mobile (<576px): "Stap X van Y" text + progress bar
 */
const WizardProgress = ({ steps, currentStep }: WizardProgressProps) => {
  const { t } = useTranslation()
  const progressPercent = Math.round((currentStep / (steps.length - 1)) * 100)

  return (
    <div className="wizard-progress mb-4">
      {/* Mobile: Text + ProgressBar (< 576px) */}
      <div className="d-block d-sm-none mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-semibold small">
            {t('common.stepOf', { current: currentStep + 1, total: steps.length, defaultValue: `Stap ${currentStep + 1} van ${steps.length}` })}
          </span>
          <span className="text-muted small">{steps[currentStep]?.title}</span>
        </div>
        <ProgressBar 
          now={progressPercent} 
          style={{ height: 6 }}
          variant="primary"
        />
      </div>

      {/* Tablet + Desktop: Circles (>= 576px) */}
      <Row className="justify-content-center d-none d-sm-flex">
        <Col lg={10}>
          <div className="d-flex align-items-center justify-content-between position-relative">
            {/* Progress Line Background */}
            <div 
              className="position-absolute bg-light" 
              style={{ 
                height: 2, 
                left: '10%', 
                right: '10%', 
                top: 16, 
                zIndex: 0 
              }} 
            />
            {/* Progress Line Filled */}
            <div 
              className="position-absolute bg-primary" 
              style={{ 
                height: 2, 
                left: '10%', 
                width: `${Math.max(0, ((currentStep) / (steps.length - 1)) * 80)}%`,
                top: 16, 
                zIndex: 1,
                transition: 'width 0.3s ease'
              }} 
            />
            
            {steps.map((step, index) => {
              const stepNumber = index + 1
              const isCompleted = index < currentStep
              const isCurrent = index === currentStep
              const isPending = index > currentStep
              
              return (
                <div 
                  key={index} 
                  className="d-flex flex-column align-items-center position-relative"
                  style={{ zIndex: 2 }}
                >
                  <div
                    className={`
                      d-flex align-items-center justify-content-center rounded-circle
                      ${isCompleted ? 'bg-primary text-white' : ''}
                      ${isCurrent ? 'bg-primary text-white' : ''}
                      ${isPending ? 'bg-light text-muted border' : ''}
                    `}
                    style={{ 
                      width: 32, 
                      height: 32,
                      transition: 'all 0.3s ease'
                    }}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {isCompleted ? (
                      <IconifyIcon icon="mingcute:check-line" className="fs-6" />
                    ) : (
                      <span className="fw-semibold small">{stepNumber}</span>
                    )}
                  </div>
                  {/* Labels: visible on desktop (>=768px), hidden on tablet (576-767px) */}
                  <small 
                    className={`mt-1 text-center d-none d-md-block ${isCurrent ? 'fw-semibold text-primary' : 'text-muted'}`}
                    style={{ 
                      maxWidth: 80, 
                      fontSize: '0.7rem',
                      lineHeight: 1.2,
                      wordBreak: 'break-word'
                    }}
                  >
                    {step.title}
                  </small>
                </div>
              )
            })}
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default WizardProgress

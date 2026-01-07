import { Row, Col } from 'react-bootstrap'
import IconifyIcon from '@/components/wrapper/IconifyIcon'

export interface WizardStep {
  title: string
}

interface WizardProgressProps {
  steps: WizardStep[]
  currentStep: number
}

/**
 * WizardProgress - Step indicator for multi-step wizards
 * 
 * Darkone 1:1 with react-bootstrap
 * Shows completed, current, and pending steps
 */
const WizardProgress = ({ steps, currentStep }: WizardProgressProps) => {
  return (
    <div className="wizard-progress mb-4">
      <Row className="justify-content-center">
        <Col lg={10}>
          <div className="d-flex align-items-center justify-content-between position-relative">
            {/* Progress Line Background */}
            <div 
              className="position-absolute bg-light" 
              style={{ 
                height: 2, 
                left: '10%', 
                right: '10%', 
                top: '50%', 
                transform: 'translateY(-50%)',
                zIndex: 0 
              }} 
            />
            {/* Progress Line Filled */}
            <div 
              className="position-absolute bg-primary" 
              style={{ 
                height: 2, 
                left: '10%', 
                width: `${Math.max(0, ((currentStep - 1) / (steps.length - 1)) * 80)}%`,
                top: '50%', 
                transform: 'translateY(-50%)',
                zIndex: 1,
                transition: 'width 0.3s ease'
              }} 
            />
            
            {steps.map((step, index) => {
              const stepNumber = index + 1
              const isCompleted = stepNumber < currentStep
              const isCurrent = stepNumber === currentStep
              const isPending = stepNumber > currentStep
              
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
                      width: 40, 
                      height: 40,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isCompleted ? (
                      <IconifyIcon icon="mingcute:check-line" className="fs-5" />
                    ) : (
                      <span className="fw-semibold">{stepNumber}</span>
                    )}
                  </div>
                  <small 
                    className={`mt-2 text-center ${isCurrent ? 'fw-semibold text-primary' : 'text-muted'}`}
                    style={{ 
                      maxWidth: 100, 
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
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

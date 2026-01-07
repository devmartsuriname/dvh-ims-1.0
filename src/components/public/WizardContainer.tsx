import { Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import WizardProgress, { type WizardStep } from './WizardProgress'

interface WizardContainerProps {
  title: string
  subtitle?: string
  steps: WizardStep[]
  currentStep: number
  children: React.ReactNode
}

/**
 * WizardContainer - Main wrapper for multi-step wizards
 * 
 * Darkone 1:1 with react-bootstrap
 * Provides layout, progress indicator, and back navigation
 */
const WizardContainer = ({
  title,
  subtitle,
  steps,
  currentStep,
  children,
}: WizardContainerProps) => {
  return (
    <section className="py-4 flex-grow-1">
      <Container>
        {/* Back to Home Link */}
        <Row className="mb-3">
          <Col>
            <Link 
              to="/" 
              className="text-decoration-none text-muted d-inline-flex align-items-center"
            >
              <IconifyIcon icon="mingcute:arrow-left-line" className="me-1" />
              Back to Home
            </Link>
          </Col>
        </Row>

        {/* Wizard Title */}
        <Row className="mb-4">
          <Col className="text-center">
            <h2 className="fw-bold mb-1">{title}</h2>
            {subtitle && (
              <p className="text-muted">{subtitle}</p>
            )}
          </Col>
        </Row>

        {/* Progress Indicator */}
        <Row className="mb-4">
          <Col>
            <WizardProgress steps={steps} currentStep={currentStep} />
          </Col>
        </Row>

        {/* Step Content */}
        <Row className="justify-content-center">
          <Col lg={8}>
            {children}
          </Col>
        </Row>
      </Container>
    </section>
  )
}

export default WizardContainer

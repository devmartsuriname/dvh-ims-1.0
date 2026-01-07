import { Card, Row, Col, Form } from 'react-bootstrap'
import { useState } from 'react'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import WizardStep from '@/components/public/WizardStep'

interface Step0IntroductionProps {
  onNext: () => void
}

/**
 * Step 0: Introduction
 * 
 * Explains the housing registration process and waiting list.
 * User must acknowledge understanding before proceeding.
 */
const Step0Introduction = ({ onNext }: Step0IntroductionProps) => {
  const [acknowledged, setAcknowledged] = useState(false)

  return (
    <WizardStep
      title="Welcome to the Housing Registration"
      description="Register for the official housing waiting list in Suriname."
      onNext={onNext}
      isFirstStep={true}
      nextDisabled={!acknowledged}
      nextLabel="Begin Registration"
    >
      <Card className="border-0 shadow-none mb-4">
        <Card.Body className="p-0">
          {/* Important Notice */}
          <div className="bg-light rounded p-3 mb-4">
            <div className="d-flex align-items-start">
              <IconifyIcon 
                icon="mingcute:information-line" 
                className="text-primary fs-4 me-2 mt-1" 
              />
              <div>
                <h6 className="fw-semibold mb-2">About the Housing Waiting List</h6>
                <p className="text-muted mb-0 small">
                  This registration places you on the official housing waiting list managed by 
                  the Ministry of Social Affairs and Housing. Registration does not guarantee 
                  immediate housing allocation. Allocation is based on availability, urgency, 
                  and waiting list position.
                </p>
              </div>
            </div>
          </div>

          {/* Process Steps */}
          <h6 className="fw-semibold mb-3">Registration Process</h6>
          <Row className="g-3 mb-4">
            <Col md={4}>
              <div className="text-center p-3 bg-light rounded">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 48, height: 48 }}>
                  <IconifyIcon icon="mingcute:edit-line" className="text-primary fs-5" />
                </div>
                <h6 className="small fw-semibold mb-1">1. Register</h6>
                <p className="text-muted small mb-0">Complete this registration form</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center p-3 bg-light rounded">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 48, height: 48 }}>
                  <IconifyIcon icon="mingcute:time-line" className="text-primary fs-5" />
                </div>
                <h6 className="small fw-semibold mb-1">2. Wait for Review</h6>
                <p className="text-muted small mb-0">Your registration will be verified</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center p-3 bg-light rounded">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 48, height: 48 }}>
                  <IconifyIcon icon="mingcute:home-4-line" className="text-primary fs-5" />
                </div>
                <h6 className="small fw-semibold mb-1">3. Get Allocated</h6>
                <p className="text-muted small mb-0">Housing assigned when available</p>
              </div>
            </Col>
          </Row>

          {/* Requirements */}
          <h6 className="fw-semibold mb-3">What You Will Need</h6>
          <ul className="list-unstyled mb-4">
            <li className="d-flex align-items-center mb-2">
              <IconifyIcon icon="mingcute:check-circle-line" className="text-success me-2" />
              <span className="small">Valid National ID number</span>
            </li>
            <li className="d-flex align-items-center mb-2">
              <IconifyIcon icon="mingcute:check-circle-line" className="text-success me-2" />
              <span className="small">Contact information (phone number required)</span>
            </li>
            <li className="d-flex align-items-center mb-2">
              <IconifyIcon icon="mingcute:check-circle-line" className="text-success me-2" />
              <span className="small">Information about your current living situation</span>
            </li>
            <li className="d-flex align-items-center mb-2">
              <IconifyIcon icon="mingcute:check-circle-line" className="text-success me-2" />
              <span className="small">Income details (if applicable)</span>
            </li>
          </ul>

          {/* Acknowledgement */}
          <div className="border rounded p-3">
            <Form.Check
              type="checkbox"
              id="acknowledgement"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              label={
                <span className="small">
                  I understand that this is a registration for the housing waiting list and that 
                  placement does not guarantee immediate housing. I confirm that I will provide 
                  accurate information.
                </span>
              }
            />
          </div>
        </Card.Body>
      </Card>
    </WizardStep>
  )
}

export default Step0Introduction

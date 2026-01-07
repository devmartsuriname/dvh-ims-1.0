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
 * Explains the application process and requirements.
 * User must acknowledge understanding before proceeding.
 */
const Step0Introduction = ({ onNext }: Step0IntroductionProps) => {
  const [acknowledged, setAcknowledged] = useState(false)

  return (
    <WizardStep
      title="Welcome to the Construction Subsidy Application"
      description="Please read the following information carefully before proceeding."
      onNext={onNext}
      isFirstStep={true}
      nextDisabled={!acknowledged}
      nextLabel="Begin Application"
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
                <h6 className="fw-semibold mb-2">Important Notice</h6>
                <p className="text-muted mb-0 small">
                  Applications submitted through this portal are for registration purposes only. 
                  No evaluation or decision will be made at the counter. All applications will be 
                  reviewed by the appropriate department and you will be contacted regarding the outcome.
                </p>
              </div>
            </div>
          </div>

          {/* Process Steps */}
          <h6 className="fw-semibold mb-3">Application Process</h6>
          <Row className="g-3 mb-4">
            <Col md={4}>
              <div className="text-center p-3 bg-light rounded">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 48, height: 48 }}>
                  <IconifyIcon icon="mingcute:edit-line" className="text-primary fs-5" />
                </div>
                <h6 className="small fw-semibold mb-1">1. Submit Application</h6>
                <p className="text-muted small mb-0">Complete this form with your information</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center p-3 bg-light rounded">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 48, height: 48 }}>
                  <IconifyIcon icon="mingcute:search-line" className="text-primary fs-5" />
                </div>
                <h6 className="small fw-semibold mb-1">2. Review Process</h6>
                <p className="text-muted small mb-0">Your application will be reviewed by staff</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center p-3 bg-light rounded">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 48, height: 48 }}>
                  <IconifyIcon icon="mingcute:mail-line" className="text-primary fs-5" />
                </div>
                <h6 className="small fw-semibold mb-1">3. Get Notified</h6>
                <p className="text-muted small mb-0">You will be contacted with the outcome</p>
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
              <span className="small">Current address details</span>
            </li>
            <li className="d-flex align-items-center mb-2">
              <IconifyIcon icon="mingcute:check-circle-line" className="text-success me-2" />
              <span className="small">Information about required documents</span>
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
                  I understand that this is a registration portal only and that no evaluation 
                  or decision will be made at the counter. I confirm that I will provide 
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

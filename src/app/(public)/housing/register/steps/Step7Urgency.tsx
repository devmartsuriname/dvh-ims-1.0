import { Card, Row, Col, Form } from 'react-bootstrap'
import { useState } from 'react'
import WizardStep from '@/components/public/WizardStep'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import type { WizardStepProps } from '../types'

/**
 * Step 7: Special Needs / Urgency
 * 
 * Collects information about disability or emergency situations.
 */
const Step7Urgency = ({ formData, updateFormData, onNext, onBack }: WizardStepProps) => {
  const [hasDisability, setHasDisability] = useState(formData.has_disability)
  const [hasEmergency, setHasEmergency] = useState(formData.has_emergency)
  const [urgencyDetails, setUrgencyDetails] = useState(formData.urgency_details)

  const handleSubmit = () => {
    updateFormData({
      has_disability: hasDisability,
      has_emergency: hasEmergency,
      urgency_details: urgencyDetails,
    })
    onNext()
  }

  return (
    <WizardStep
      title="Special Needs & Urgency"
      description="Do you have any special circumstances that require urgent attention?"
      onBack={onBack}
      onNext={handleSubmit}
    >
      <Card className="border-0 shadow-none">
        <Card.Body className="p-0">
          {/* Info Notice */}
          <div className="bg-light rounded p-3 mb-4">
            <div className="d-flex align-items-start">
              <IconifyIcon 
                icon="mingcute:information-line" 
                className="text-primary fs-4 me-2 mt-1" 
              />
              <div>
                <p className="text-muted mb-0 small">
                  Special circumstances may affect your position on the waiting list. 
                  Please provide accurate information. Documentation may be required 
                  for verification.
                </p>
              </div>
            </div>
          </div>

          <Row className="g-3">
            <Col xs={12}>
              <Form.Group>
                <Form.Check
                  type="checkbox"
                  id="has_disability"
                  checked={hasDisability}
                  onChange={(e) => setHasDisability(e.target.checked)}
                  label={
                    <span>
                      <strong>Disability or Special Medical Needs</strong>
                      <br />
                      <span className="text-muted small">
                        You or a household member has a disability or medical condition 
                        requiring specific housing accommodations.
                      </span>
                    </span>
                  }
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group>
                <Form.Check
                  type="checkbox"
                  id="has_emergency"
                  checked={hasEmergency}
                  onChange={(e) => setHasEmergency(e.target.checked)}
                  label={
                    <span>
                      <strong>Emergency / Urgent Situation</strong>
                      <br />
                      <span className="text-muted small">
                        You are facing an emergency situation such as homelessness, 
                        displacement due to calamity, or imminent eviction.
                      </span>
                    </span>
                  }
                />
              </Form.Group>
            </Col>

            {(hasDisability || hasEmergency) && (
              <Col xs={12}>
                <Form.Group className="mt-3">
                  <Form.Label>Please provide details about your situation</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={urgencyDetails}
                    onChange={(e) => setUrgencyDetails(e.target.value)}
                    placeholder="Describe your special circumstances..."
                  />
                  <div className="text-muted small mt-1">
                    This information will be reviewed to assess urgency priority.
                  </div>
                </Form.Group>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>
    </WizardStep>
  )
}

export default Step7Urgency

import { Card, Row, Col, Form } from 'react-bootstrap'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import WizardStep from '@/components/public/WizardStep'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import type { WizardStepProps } from '../types'

/**
 * Step 7: Special Needs / Urgency
 * 
 * Collects information about disability or emergency situations.
 * i18n enabled - NL default
 */
const Step7Urgency = ({ formData, updateFormData, onNext, onBack }: WizardStepProps) => {
  const { t } = useTranslation()
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
      title={t('housing.step7.title')}
      description={t('housing.step7.description')}
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
                  {t('housing.step7.infoText')}
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
                      <strong>{t('housing.step7.disability')}</strong>
                      <br />
                      <span className="text-muted small">
                        {t('housing.step7.disabilityDescription')}
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
                      <strong>{t('housing.step7.emergency')}</strong>
                      <br />
                      <span className="text-muted small">
                        {t('housing.step7.emergencyDescription')}
                      </span>
                    </span>
                  }
                />
              </Form.Group>
            </Col>

            {(hasDisability || hasEmergency) && (
              <Col xs={12}>
                <Form.Group className="mt-3">
                  <Form.Label>{t('housing.step7.detailsLabel')}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={urgencyDetails}
                    onChange={(e) => setUrgencyDetails(e.target.value)}
                    placeholder={t('housing.step7.detailsPlaceholder')}
                  />
                  <div className="text-muted small mt-1">
                    {t('housing.step7.detailsHelp')}
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

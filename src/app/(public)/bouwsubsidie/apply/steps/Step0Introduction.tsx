import { Row, Col, Form } from 'react-bootstrap'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import WizardStep from '@/components/public/WizardStep'

interface Step0IntroductionProps {
  onNext: () => void
}

/**
 * Step 0: Introduction
 * V1.3 Phase 5A — Localized with i18n
 * 
 * Explains the application process and requirements.
 * User must acknowledge understanding before proceeding.
 */
const Step0Introduction = ({ onNext }: Step0IntroductionProps) => {
  const { t } = useTranslation()
  const [acknowledged, setAcknowledged] = useState(false)

  return (
    <WizardStep
      title={t('bouwsubsidie.step0.title')}
      description={t('bouwsubsidie.step0.description')}
      onNext={onNext}
      isFirstStep={true}
      nextDisabled={!acknowledged}
      nextLabel={t('common.beginApplication')}
    >
      <div>
          {/* Important Notice */}
          <div className="bg-light rounded p-3 mb-4">
            <div className="d-flex align-items-start">
              <IconifyIcon 
                icon="mingcute:information-line" 
                className="text-primary fs-4 me-2 mt-1" 
              />
              <div>
                <h6 className="fw-semibold mb-2">{t('bouwsubsidie.step0.importantNotice')}</h6>
                <p className="text-muted mb-0 small">
                  {t('bouwsubsidie.step0.noticeText')}
                </p>
              </div>
            </div>
          </div>

          {/* Process Steps */}
          <h6 className="fw-semibold mb-3">{t('bouwsubsidie.step0.processTitle')}</h6>
          <Row className="g-3 mb-4">
            <Col md={4}>
              <div className="text-center p-3 bg-light rounded">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 48, height: 48 }}>
                  <IconifyIcon icon="mingcute:edit-line" className="text-primary fs-5" />
                </div>
                <h6 className="small fw-semibold mb-1">{t('bouwsubsidie.step0.process1Title')}</h6>
                <p className="text-muted small mb-0">{t('bouwsubsidie.step0.process1Text')}</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center p-3 bg-light rounded">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 48, height: 48 }}>
                  <IconifyIcon icon="mingcute:search-line" className="text-primary fs-5" />
                </div>
                <h6 className="small fw-semibold mb-1">{t('bouwsubsidie.step0.process2Title')}</h6>
                <p className="text-muted small mb-0">{t('bouwsubsidie.step0.process2Text')}</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center p-3 bg-light rounded">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 48, height: 48 }}>
                  <IconifyIcon icon="mingcute:mail-line" className="text-primary fs-5" />
                </div>
                <h6 className="small fw-semibold mb-1">{t('bouwsubsidie.step0.process3Title')}</h6>
                <p className="text-muted small mb-0">{t('bouwsubsidie.step0.process3Text')}</p>
              </div>
            </Col>
          </Row>

          {/* Requirements */}
          <h6 className="fw-semibold mb-3">{t('bouwsubsidie.step0.requirementsTitle')}</h6>
          <ul className="list-unstyled mb-4">
            <li className="d-flex align-items-center mb-2">
              <IconifyIcon icon="mingcute:check-circle-line" className="text-success me-2" />
              <span className="small">{t('bouwsubsidie.step0.requirement1')}</span>
            </li>
            <li className="d-flex align-items-center mb-2">
              <IconifyIcon icon="mingcute:check-circle-line" className="text-success me-2" />
              <span className="small">{t('bouwsubsidie.step0.requirement2')}</span>
            </li>
            <li className="d-flex align-items-center mb-2">
              <IconifyIcon icon="mingcute:check-circle-line" className="text-success me-2" />
              <span className="small">{t('bouwsubsidie.step0.requirement3')}</span>
            </li>
            <li className="d-flex align-items-center mb-2">
              <IconifyIcon icon="mingcute:check-circle-line" className="text-success me-2" />
              <span className="small">{t('bouwsubsidie.step0.requirement4')}</span>
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
                  {t('bouwsubsidie.step0.acknowledgementLabel')}
                </span>
              }
            />
          </div>
      </div>
    </WizardStep>
  )
}

export default Step0Introduction

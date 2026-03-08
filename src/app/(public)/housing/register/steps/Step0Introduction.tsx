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
 * V1.8 Phase 2.1 — Added 2-column "Benodigde documenten" block
 */
const Step0Introduction = ({ onNext }: Step0IntroductionProps) => {
  const { t } = useTranslation()
  const [acknowledged, setAcknowledged] = useState(false)

  return (
    <WizardStep
      title={t('housing.step0.title')}
      description={t('housing.step0.description')}
      onNext={onNext}
      isFirstStep={true}
      nextDisabled={!acknowledged}
      nextLabel={t('common.beginRegistration')}
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
                <h6 className="fw-semibold mb-2">{t('housing.step0.aboutTitle')}</h6>
                <p className="text-muted mb-0 small">
                  {t('housing.step0.aboutText')}
                </p>
              </div>
            </div>
          </div>

          {/* Process Steps */}
          <h6 className="fw-semibold mb-3">{t('housing.step0.processTitle')}</h6>
          <Row className="g-3 mb-4">
            <Col md={4}>
              <div className="text-center p-3 bg-light rounded">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 48, height: 48 }}>
                  <IconifyIcon icon="mingcute:edit-line" className="text-primary fs-5" />
                </div>
                <h6 className="small fw-semibold mb-1">{t('housing.step0.process1Title')}</h6>
                <p className="text-muted small mb-0">{t('housing.step0.process1Text')}</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center p-3 bg-light rounded">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 48, height: 48 }}>
                  <IconifyIcon icon="mingcute:time-line" className="text-primary fs-5" />
                </div>
                <h6 className="small fw-semibold mb-1">{t('housing.step0.process2Title')}</h6>
                <p className="text-muted small mb-0">{t('housing.step0.process2Text')}</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center p-3 bg-light rounded">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 48, height: 48 }}>
                  <IconifyIcon icon="mingcute:home-4-line" className="text-primary fs-5" />
                </div>
                <h6 className="small fw-semibold mb-1">{t('housing.step0.process3Title')}</h6>
                <p className="text-muted small mb-0">{t('housing.step0.process3Text')}</p>
              </div>
            </Col>
          </Row>

          {/* Requirements — 2-column layout */}
          <Row className="g-4 mb-4">
            <Col md={6}>
              <h6 className="fw-semibold mb-3">{t('housing.step0.requirementsTitle')}</h6>
              <ul className="list-unstyled mb-0">
                <li className="d-flex align-items-start mb-2">
                  <IconifyIcon icon="mingcute:check-circle-line" className="text-success me-2 mt-1" style={{ minWidth: 16, minHeight: 16 }} />
                  <span className="small">{t('housing.step0.requirement1')}</span>
                </li>
                <li className="d-flex align-items-start mb-2">
                  <IconifyIcon icon="mingcute:check-circle-line" className="text-success me-2 mt-1" style={{ minWidth: 16, minHeight: 16 }} />
                  <span className="small">{t('housing.step0.requirement2')}</span>
                </li>
                <li className="d-flex align-items-start mb-2">
                  <IconifyIcon icon="mingcute:check-circle-line" className="text-success me-2 mt-1" style={{ minWidth: 16, minHeight: 16 }} />
                  <span className="small">{t('housing.step0.requirement3')}</span>
                </li>
                <li className="d-flex align-items-start mb-2">
                  <IconifyIcon icon="mingcute:check-circle-line" className="text-success me-2 mt-1" style={{ minWidth: 16, minHeight: 16 }} />
                  <span className="small">{t('housing.step0.requirement4')}</span>
                </li>
              </ul>
            </Col>
            <Col md={6}>
              <h6 className="fw-semibold mb-3">
                <IconifyIcon icon="mingcute:folder-line" className="me-1" />
                {t('housing.step0.docsTitle')}
              </h6>
              <ul className="list-unstyled mb-2">
                <li className="d-flex align-items-start mb-2">
                  <IconifyIcon icon="mingcute:check-circle-line" className="text-success me-2 mt-1" style={{ minWidth: 16, minHeight: 16 }} />
                  <span className="small">{t('housing.step0.doc1')}</span>
                </li>
                <li className="d-flex align-items-start mb-2">
                  <IconifyIcon icon="mingcute:check-circle-line" className="text-success me-2 mt-1" style={{ minWidth: 16, minHeight: 16 }} />
                  <span className="small">{t('housing.step0.doc2')}</span>
                </li>
                <li className="d-flex align-items-start mb-2">
                  <IconifyIcon icon="mingcute:check-circle-line" className="text-success me-2 mt-1" style={{ minWidth: 16, minHeight: 16 }} />
                  <span className="small">{t('housing.step0.doc3')}</span>
                </li>
              </ul>
              <div className="d-flex align-items-start text-muted small mb-0">
                <IconifyIcon icon="mingcute:information-line" className="me-2 mt-1" style={{ minWidth: 16, minHeight: 16 }} />
                <span>{t('housing.step0.docsNote')}</span>
              </div>
            </Col>
          </Row>

          {/* Acknowledgement */}
          <div className="border rounded p-3">
            <Form.Check
              type="checkbox"
              id="acknowledgement"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              label={
                <span className="small">
                  {t('housing.step0.acknowledgementLabel')}
                </span>
              }
            />
          </div>
      </div>
    </WizardStep>
  )
}

export default Step0Introduction

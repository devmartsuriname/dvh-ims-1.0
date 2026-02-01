import { Card, Row, Col, Form, Badge } from 'react-bootstrap'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import WizardStep from '@/components/public/WizardStep'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { DISTRICTS } from '@/constants/districts'
import { APPLICATION_REASONS, GENDER_OPTIONS } from '../constants'
import type { BouwsubsidieFormData } from '../types'

interface Step7ReviewProps {
  formData: BouwsubsidieFormData
  updateFormData: (data: Partial<BouwsubsidieFormData>) => void
  onNext: () => void
  onBack: () => void
  isSubmitting: boolean
}

/**
 * Step 7: Review & Confirmation
 * V1.3 Phase 5A — Localized with i18n + Updated for Document Upload
 * 
 * Summary of all entered data with declaration of truthfulness.
 */
const Step7Review = ({ formData, updateFormData, onNext, onBack, isSubmitting }: Step7ReviewProps) => {
  const { t } = useTranslation()
  const [accepted, setAccepted] = useState(formData.declaration_accepted)

  const handleAcceptChange = (value: boolean) => {
    setAccepted(value)
    updateFormData({ declaration_accepted: value })
  }

  const handleSubmit = () => {
    if (accepted) {
      onNext()
    }
  }

  const getDistrictName = (code: string) => {
    return DISTRICTS.find((d) => d.code === code)?.name || code
  }

  const getReasonLabel = (value: string) => {
    const reason = APPLICATION_REASONS.find((r) => r.value === value)
    return reason ? t(reason.labelKey) : value
  }

  const getGenderLabel = (value: string) => {
    const gender = GENDER_OPTIONS.find((g) => g.value === value)
    return gender ? t(gender.labelKey) : value
  }

  const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card className="mb-3">
      <Card.Header className="bg-light py-2">
        <h6 className="mb-0 fw-semibold">{title}</h6>
      </Card.Header>
      <Card.Body className="py-3">{children}</Card.Body>
    </Card>
  )

  const DataRow = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <Row className="mb-2">
      <Col xs={5} className="text-muted small">{label}</Col>
      <Col xs={7} className="small fw-medium">{value || '—'}</Col>
    </Row>
  )

  // Count uploaded documents
  const uploadedDocs = formData.documents.filter(d => d.uploaded_file)
  const mandatoryDocs = formData.documents.filter(d => d.is_mandatory)
  const uploadedMandatoryDocs = mandatoryDocs.filter(d => d.uploaded_file)

  return (
    <WizardStep
      title={t('bouwsubsidie.step7.title')}
      description={t('bouwsubsidie.step7.description')}
      onBack={onBack}
      onNext={handleSubmit}
      isLastStep={true}
      isSubmitting={isSubmitting}
      nextDisabled={!accepted}
      nextLabel={t('common.submitApplication')}
    >
      {/* Personal Information */}
      <SectionCard title={t('bouwsubsidie.step7.sectionPersonal')}>
        <DataRow label={t('bouwsubsidie.step1.nationalId')} value={formData.national_id} />
        <DataRow label={t('bouwsubsidie.step1.firstName')} value={formData.first_name} />
        <DataRow label={t('bouwsubsidie.step1.lastName')} value={formData.last_name} />
        <DataRow label={t('bouwsubsidie.step1.dateOfBirth')} value={formData.date_of_birth} />
        <DataRow label={t('bouwsubsidie.step1.gender')} value={getGenderLabel(formData.gender)} />
      </SectionCard>

      {/* Contact Information */}
      <SectionCard title={t('bouwsubsidie.step7.sectionContact')}>
        <DataRow label={t('bouwsubsidie.step2.phoneNumber')} value={formData.phone_number} />
        <DataRow label={t('bouwsubsidie.step2.email')} value={formData.email} />
      </SectionCard>

      {/* Household Information */}
      <SectionCard title={t('bouwsubsidie.step7.sectionHousehold')}>
        <DataRow label={t('bouwsubsidie.step3.householdSize')} value={formData.household_size} />
        <DataRow label={t('bouwsubsidie.step3.dependents')} value={formData.dependents} />
      </SectionCard>

      {/* Address */}
      <SectionCard title={t('bouwsubsidie.step7.sectionAddress')}>
        <DataRow label={t('bouwsubsidie.step4.addressLine1')} value={formData.address_line_1} />
        <DataRow label={t('bouwsubsidie.step4.district')} value={getDistrictName(formData.district)} />
        <DataRow label={t('bouwsubsidie.step4.ressort')} value={formData.ressort} />
      </SectionCard>

      {/* Application Details */}
      <SectionCard title={t('bouwsubsidie.step7.sectionApplication')}>
        <DataRow label={t('bouwsubsidie.step5.applicationReason')} value={getReasonLabel(formData.application_reason)} />
        <DataRow label={t('bouwsubsidie.step5.estimatedAmount')} value={formData.estimated_amount ? `SRD ${formData.estimated_amount}` : undefined} />
        <Row className="mb-2">
          <Col xs={5} className="text-muted small">{t('bouwsubsidie.step7.emergencyApplication')}</Col>
          <Col xs={7}>
            {formData.is_calamity ? (
              <Badge bg="warning" className="text-dark">{t('common.yes')}</Badge>
            ) : (
              <Badge bg="secondary">{t('common.no')}</Badge>
            )}
          </Col>
        </Row>
      </SectionCard>

      {/* Uploaded Documents */}
      <SectionCard title={t('bouwsubsidie.step7.sectionDocuments')}>
        <div className="small">
          <p className="mb-2">
            <strong>{uploadedDocs.length}</strong> {t('bouwsubsidie.step6.of')} <strong>{formData.documents.length}</strong> {t('bouwsubsidie.step6.documentsUploaded')}
            <Badge bg="success" className="ms-2">
              {t('bouwsubsidie.step6.mandatory')}: {uploadedMandatoryDocs.length}/{mandatoryDocs.length}
            </Badge>
          </p>
          {formData.documents.map((doc) => (
            <div key={doc.id} className="d-flex align-items-center mb-1">
              <IconifyIcon
                icon={doc.uploaded_file ? 'mingcute:check-circle-fill' : 'mingcute:close-circle-line'}
                className={doc.uploaded_file ? 'text-success me-2' : 'text-secondary me-2'}
              />
              <span className={doc.uploaded_file ? '' : 'text-muted'}>
                {t(doc.label)}
                {doc.uploaded_file && (
                  <span className="text-muted ms-1">({doc.uploaded_file.file_name})</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Declaration */}
      <Card className="border-primary">
        <Card.Body>
          <Form.Check
            type="checkbox"
            id="declaration"
            checked={accepted}
            onChange={(e) => handleAcceptChange(e.target.checked)}
            label={
              <span>
                <strong>{t('bouwsubsidie.step7.declarationTitle')}</strong>
                <br />
                <span className="text-muted small">
                  {t('bouwsubsidie.step7.declarationText')}
                </span>
              </span>
            }
          />
        </Card.Body>
      </Card>
    </WizardStep>
  )
}

export default Step7Review

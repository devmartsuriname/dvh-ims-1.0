import { Card, Row, Col, Form } from 'react-bootstrap'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import WizardStep from '@/components/public/WizardStep'
import { DISTRICTS } from '@/constants/districts'
import { 
  HOUSING_TYPES, 
  INTEREST_TYPES, 
  APPLICATION_REASONS, 
  INCOME_SOURCES,
  GENDER_OPTIONS
} from '../constants'
import type { HousingFormData } from '../types'

interface Step8ReviewProps {
  formData: HousingFormData
  updateFormData: (data: Partial<HousingFormData>) => void
  onNext: () => void
  onBack: () => void
  isSubmitting: boolean
}

/**
 * Step 8: Review & Confirmation
 * 
 * Summary of all entered data with declaration of truthfulness.
 * i18n enabled - NL default
 */
const Step8Review = ({ formData, updateFormData, onNext, onBack, isSubmitting }: Step8ReviewProps) => {
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

  const getHousingTypeName = (value: string) => {
    const item = HOUSING_TYPES.find((t) => t.value === value)
    return item ? t(item.labelKey) : value
  }

  const getInterestTypeName = (value: string) => {
    const item = INTEREST_TYPES.find((t) => t.value === value)
    return item ? t(item.labelKey) : value
  }

  const getReasonLabel = (value: string) => {
    const item = APPLICATION_REASONS.find((r) => r.value === value)
    return item ? t(item.labelKey) : value
  }

  const getIncomeSourceLabel = (value: string) => {
    const item = INCOME_SOURCES.find((s) => s.value === value)
    return item ? t(item.labelKey) : value
  }

  const getGenderLabel = (value: string) => {
    const item = GENDER_OPTIONS.find((g) => g.value === value)
    return item ? t(item.labelKey) : value
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

  return (
    <WizardStep
      title={t('housing.step8.title')}
      description={t('housing.step8.description')}
      onBack={onBack}
      onNext={handleSubmit}
      isLastStep={true}
      isSubmitting={isSubmitting}
      nextDisabled={!accepted}
      nextLabel={t('common.submitRegistration')}
    >
      {/* Personal Information */}
      <SectionCard title={t('housing.step8.sectionPersonal')}>
        <DataRow label={t('housing.step8.labelNationalId')} value={formData.national_id} />
        <DataRow label={t('housing.step8.labelFirstName')} value={formData.first_name} />
        <DataRow label={t('housing.step8.labelLastName')} value={formData.last_name} />
        <DataRow label={t('housing.step8.labelDateOfBirth')} value={formData.date_of_birth} />
        <DataRow label={t('housing.step8.labelGender')} value={getGenderLabel(formData.gender)} />
      </SectionCard>

      {/* Contact Information */}
      <SectionCard title={t('housing.step8.sectionContact')}>
        <DataRow label={t('housing.step8.labelPhone')} value={formData.phone_number} />
        <DataRow label={t('housing.step8.labelEmail')} value={formData.email} />
      </SectionCard>

      {/* Current Living Situation */}
      <SectionCard title={t('housing.step8.sectionLiving')}>
        <DataRow label={t('housing.step8.labelAddress')} value={formData.address_line_1} />
        <DataRow label={t('housing.step8.labelDistrict')} value={getDistrictName(formData.district)} />
        <DataRow label={t('housing.step8.labelHousingType')} value={getHousingTypeName(formData.current_housing_type)} />
        <DataRow label={t('housing.step8.labelMonthlyRent')} value={formData.monthly_rent ? `SRD ${formData.monthly_rent}` : undefined} />
        <DataRow label={t('housing.step8.labelResidents')} value={formData.number_of_residents} />
      </SectionCard>

      {/* Housing Preference */}
      <SectionCard title={t('housing.step8.sectionPreference')}>
        <DataRow label={t('housing.step8.labelInterestType')} value={getInterestTypeName(formData.interest_type)} />
        <DataRow label={t('housing.step8.labelPreferredDistrict')} value={getDistrictName(formData.preferred_district)} />
      </SectionCard>

      {/* Application Details */}
      <SectionCard title={t('housing.step8.sectionApplication')}>
        <DataRow label={t('housing.step8.labelReason')} value={getReasonLabel(formData.application_reason)} />
        <DataRow label={t('housing.step8.labelIncomeSource')} value={getIncomeSourceLabel(formData.income_source)} />
        <DataRow label={t('housing.step8.labelYourIncome')} value={formData.monthly_income_applicant ? `SRD ${formData.monthly_income_applicant}` : undefined} />
        <DataRow label={t('housing.step8.labelPartnerIncome')} value={formData.monthly_income_partner ? `SRD ${formData.monthly_income_partner}` : undefined} />
      </SectionCard>

      {/* Urgency */}
      <SectionCard title={t('housing.step8.sectionUrgency')}>
        <Row className="mb-2">
          <Col xs={5} className="text-muted small">{t('housing.step8.labelDisability')}</Col>
          <Col xs={7}>
            {formData.has_disability ? (
              <span className="badge bg-warning text-dark">{t('common.yes')}</span>
            ) : (
              <span className="badge bg-secondary">{t('common.no')}</span>
            )}
          </Col>
        </Row>
        <Row className="mb-2">
          <Col xs={5} className="text-muted small">{t('housing.step8.labelEmergency')}</Col>
          <Col xs={7}>
            {formData.has_emergency ? (
              <span className="badge bg-danger">{t('common.yes')}</span>
            ) : (
              <span className="badge bg-secondary">{t('common.no')}</span>
            )}
          </Col>
        </Row>
        {formData.urgency_details && (
          <DataRow label={t('housing.step8.labelDetails')} value={formData.urgency_details} />
        )}
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
                <strong>{t('housing.step8.declarationTitle')}</strong>
                <br />
                <span className="text-muted small">
                  {t('housing.step8.declarationText')}
                </span>
              </span>
            }
          />
        </Card.Body>
      </Card>
    </WizardStep>
  )
}

export default Step8Review

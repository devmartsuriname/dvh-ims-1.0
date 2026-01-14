import { Card, Row, Col, Form } from 'react-bootstrap'
import { useState } from 'react'
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
 * 
 * UPDATED: Admin v1.1-D - Updated to show first_name + last_name instead of full_name,
 * gender field, and address_line_1/district instead of current_address/current_district
 */
const Step8Review = ({ formData, updateFormData, onNext, onBack, isSubmitting }: Step8ReviewProps) => {
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
    return HOUSING_TYPES.find((t) => t.value === value)?.label || value
  }

  const getInterestTypeName = (value: string) => {
    return INTEREST_TYPES.find((t) => t.value === value)?.label || value
  }

  const getReasonLabel = (value: string) => {
    return APPLICATION_REASONS.find((r) => r.value === value)?.label || value
  }

  const getIncomeSourceLabel = (value: string) => {
    return INCOME_SOURCES.find((s) => s.value === value)?.label || value
  }

  const getGenderLabel = (value: string) => {
    return GENDER_OPTIONS.find((g) => g.value === value)?.label || value
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
      title="Review Your Registration"
      description="Please verify all information before submitting."
      onBack={onBack}
      onNext={handleSubmit}
      isLastStep={true}
      isSubmitting={isSubmitting}
      nextDisabled={!accepted}
      nextLabel="Submit Registration"
    >
      {/* Personal Information */}
      <SectionCard title="Personal Information">
        <DataRow label="National ID" value={formData.national_id} />
        <DataRow label="First Name" value={formData.first_name} />
        <DataRow label="Last Name" value={formData.last_name} />
        <DataRow label="Date of Birth" value={formData.date_of_birth} />
        <DataRow label="Gender" value={getGenderLabel(formData.gender)} />
      </SectionCard>

      {/* Contact Information */}
      <SectionCard title="Contact Information">
        <DataRow label="Phone Number" value={formData.phone_number} />
        <DataRow label="Email" value={formData.email} />
      </SectionCard>

      {/* Current Living Situation */}
      <SectionCard title="Current Living Situation">
        <DataRow label="Address" value={formData.address_line_1} />
        <DataRow label="District" value={getDistrictName(formData.district)} />
        <DataRow label="Housing Type" value={getHousingTypeName(formData.current_housing_type)} />
        <DataRow label="Monthly Rent" value={formData.monthly_rent ? `SRD ${formData.monthly_rent}` : undefined} />
        <DataRow label="Residents" value={formData.number_of_residents} />
      </SectionCard>

      {/* Housing Preference */}
      <SectionCard title="Housing Preference">
        <DataRow label="Interest Type" value={getInterestTypeName(formData.interest_type)} />
        <DataRow label="Preferred District" value={getDistrictName(formData.preferred_district)} />
      </SectionCard>

      {/* Application Details */}
      <SectionCard title="Application Details">
        <DataRow label="Reason" value={getReasonLabel(formData.application_reason)} />
        <DataRow label="Income Source" value={getIncomeSourceLabel(formData.income_source)} />
        <DataRow label="Your Income" value={formData.monthly_income_applicant ? `SRD ${formData.monthly_income_applicant}` : undefined} />
        <DataRow label="Partner Income" value={formData.monthly_income_partner ? `SRD ${formData.monthly_income_partner}` : undefined} />
      </SectionCard>

      {/* Urgency */}
      <SectionCard title="Special Needs & Urgency">
        <Row className="mb-2">
          <Col xs={5} className="text-muted small">Disability</Col>
          <Col xs={7}>
            {formData.has_disability ? (
              <span className="badge bg-warning text-dark">Yes</span>
            ) : (
              <span className="badge bg-secondary">No</span>
            )}
          </Col>
        </Row>
        <Row className="mb-2">
          <Col xs={5} className="text-muted small">Emergency</Col>
          <Col xs={7}>
            {formData.has_emergency ? (
              <span className="badge bg-danger">Yes</span>
            ) : (
              <span className="badge bg-secondary">No</span>
            )}
          </Col>
        </Row>
        {formData.urgency_details && (
          <DataRow label="Details" value={formData.urgency_details} />
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
                <strong>Declaration of Truthfulness</strong>
                <br />
                <span className="text-muted small">
                  I hereby declare that all information provided in this registration is true 
                  and accurate to the best of my knowledge. I understand that providing false 
                  information may result in removal from the waiting list and possible legal consequences.
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

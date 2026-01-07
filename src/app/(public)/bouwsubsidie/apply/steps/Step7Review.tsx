import { Card, Row, Col, Form } from 'react-bootstrap'
import { useState } from 'react'
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
 * 
 * Summary of all entered data with declaration of truthfulness.
 */
const Step7Review = ({ formData, updateFormData, onNext, onBack, isSubmitting }: Step7ReviewProps) => {
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
    return APPLICATION_REASONS.find((r) => r.value === value)?.label || value
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
      title="Review Your Application"
      description="Please verify all information before submitting."
      onBack={onBack}
      onNext={handleSubmit}
      isLastStep={true}
      isSubmitting={isSubmitting}
      nextDisabled={!accepted}
      nextLabel="Submit Application"
    >
      {/* Personal Information */}
      <SectionCard title="Personal Information">
        <DataRow label="National ID" value={formData.national_id} />
        <DataRow label="Full Name" value={formData.full_name} />
        <DataRow label="Date of Birth" value={formData.date_of_birth} />
        <DataRow label="Gender" value={getGenderLabel(formData.gender)} />
      </SectionCard>

      {/* Contact Information */}
      <SectionCard title="Contact Information">
        <DataRow label="Phone Number" value={formData.phone_number} />
        <DataRow label="Email" value={formData.email} />
      </SectionCard>

      {/* Household Information */}
      <SectionCard title="Household Information">
        <DataRow label="Household Size" value={formData.household_size} />
        <DataRow label="Dependents" value={formData.dependents} />
      </SectionCard>

      {/* Address */}
      <SectionCard title="Current Address">
        <DataRow label="Address" value={formData.address_line} />
        <DataRow label="District" value={getDistrictName(formData.district)} />
        <DataRow label="Ressort" value={formData.ressort} />
      </SectionCard>

      {/* Application Details */}
      <SectionCard title="Application Details">
        <DataRow label="Reason" value={getReasonLabel(formData.application_reason)} />
        <DataRow label="Estimated Amount" value={formData.estimated_amount ? `SRD ${formData.estimated_amount}` : undefined} />
        <Row className="mb-2">
          <Col xs={5} className="text-muted small">Emergency Application</Col>
          <Col xs={7}>
            {formData.is_calamity ? (
              <span className="badge bg-warning text-dark">Yes</span>
            ) : (
              <span className="badge bg-secondary">No</span>
            )}
          </Col>
        </Row>
      </SectionCard>

      {/* Documents */}
      <SectionCard title="Document Declaration">
        <div className="small">
          <p className="mb-2">
            <strong>{formData.documents.filter((d) => d.hasDocument).length}</strong> of{' '}
            <strong>{formData.documents.length}</strong> documents available
          </p>
          {formData.documents.map((doc) => (
            <div key={doc.id} className="d-flex align-items-center mb-1">
              <IconifyIcon
                icon={doc.hasDocument ? 'mingcute:check-circle-fill' : 'mingcute:close-circle-line'}
                className={doc.hasDocument ? 'text-success me-2' : 'text-secondary me-2'}
              />
              <span className={doc.hasDocument ? '' : 'text-muted'}>{doc.label}</span>
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
                <strong>Declaration of Truthfulness</strong>
                <br />
                <span className="text-muted small">
                  I hereby declare that all information provided in this application is true 
                  and accurate to the best of my knowledge. I understand that providing false 
                  information may result in rejection of my application and possible legal consequences.
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

import { useEffect, useState } from 'react'
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap'
import { supabase } from '@/integrations/supabase/client'
import { notify } from '@/utils/notify'
import { useAuditLog } from '@/hooks/useAuditLog'

interface SubsidyCase {
  id: string
  case_number: string
  household_id: string
  applicant_person_id: string
  status: string
  district_code: string
  requested_amount: number | null
}

interface Person {
  id: string
  first_name: string
  last_name: string
  national_id: string
}

interface Household {
  id: string
  district_code: string
  primary_person_id: string
  household_size: number
}

interface CaseFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  subsidyCase?: SubsidyCase
}

interface ValidationErrors {
  applicant?: string
  household?: string
  district?: string
  amount?: string
}

const DISTRICT_CODES = [
  'PAR', 'WAI', 'NIC', 'COR', 'SAR', 'COM', 'MAR', 'PAA', 'BRO', 'SIP'
]

const CaseFormModal = ({ isOpen, onClose, onSuccess, subsidyCase }: CaseFormModalProps) => {
  const [loading, setLoading] = useState(false)
  const [persons, setPersons] = useState<Person[]>([])
  const [households, setHouseholds] = useState<Household[]>([])
  const [formData, setFormData] = useState({
    household_id: '',
    applicant_person_id: '',
    district_code: '',
    requested_amount: '',
  })
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [validated, setValidated] = useState(false)
  const { logEvent } = useAuditLog()

  useEffect(() => {
    if (isOpen) {
      fetchPersonsAndHouseholds()
      setValidationErrors({})
      setValidated(false)
      if (subsidyCase) {
        setFormData({
          household_id: subsidyCase.household_id,
          applicant_person_id: subsidyCase.applicant_person_id,
          district_code: subsidyCase.district_code,
          requested_amount: subsidyCase.requested_amount?.toString() || '',
        })
      } else {
        setFormData({
          household_id: '',
          applicant_person_id: '',
          district_code: '',
          requested_amount: '',
        })
      }
    }
  }, [isOpen, subsidyCase])

  const fetchPersonsAndHouseholds = async () => {
    const [personsRes, householdsRes] = await Promise.all([
      supabase.from('person').select('id, first_name, last_name, national_id').order('first_name'),
      supabase.from('household').select('id, district_code, primary_person_id, household_size').order('created_at', { ascending: false })
    ])

    setPersons(personsRes.data || [])
    setHouseholds(householdsRes.data || [])
  }

  const generateCaseNumber = () => {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `BS-${year}-${random}`
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    if (!formData.applicant_person_id) {
      errors.applicant = 'Applicant is required'
    }
    if (!formData.household_id) {
      errors.household = 'Household is required'
    }
    if (!formData.district_code) {
      errors.district = 'District is required'
    }
    if (formData.requested_amount && parseFloat(formData.requested_amount) < 0) {
      errors.amount = 'Amount must be 0 or greater'
    }

    setValidationErrors(errors)
    setValidated(true)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (subsidyCase) {
        // Update existing case
        const { error } = await supabase
          .from('subsidy_case')
          .update({
            household_id: formData.household_id,
            applicant_person_id: formData.applicant_person_id,
            district_code: formData.district_code,
            requested_amount: formData.requested_amount ? parseFloat(formData.requested_amount) : null,
          })
          .eq('id', subsidyCase.id)

        if (error) throw error

        await logEvent({
          action: 'UPDATE',
          entity_type: 'subsidy_case',
          entity_id: subsidyCase.id,
          reason: 'Case updated via admin UI',
        })

        notify.success('Case updated successfully')
      } else {
        // Create new case
        const caseNumber = generateCaseNumber()
        const { data, error } = await supabase
          .from('subsidy_case')
          .insert({
            case_number: caseNumber,
            household_id: formData.household_id,
            applicant_person_id: formData.applicant_person_id,
            district_code: formData.district_code,
            requested_amount: formData.requested_amount ? parseFloat(formData.requested_amount) : null,
            status: 'received',
            created_by: user?.id,
          })
          .select('id')
          .single()

        if (error) throw error

        // Create initial status history entry
        await supabase
          .from('subsidy_case_status_history')
          .insert({
            case_id: data.id,
            from_status: null,
            to_status: 'received',
            changed_by: user?.id,
            reason: 'Case created',
          })

        // Create empty social and technical reports
        await Promise.all([
          supabase.from('social_report').insert({
            case_id: data.id,
            report_json: {},
            created_by: user?.id,
          }),
          supabase.from('technical_report').insert({
            case_id: data.id,
            report_json: {},
            created_by: user?.id,
          })
        ])

        await logEvent({
          action: 'CREATE',
          entity_type: 'subsidy_case',
          entity_id: data.id,
          reason: 'Case created via admin UI',
        })

        notify.success(`Case ${caseNumber} created successfully`)
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      notify.error(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Clear specific error on change
  const clearFieldError = (field: keyof ValidationErrors) => {
    if (validated) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Modal show={isOpen} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{subsidyCase ? 'Edit Case' : 'New Subsidy Case'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Applicant (Person) <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="applicant_person_id"
                  value={formData.applicant_person_id}
                  onChange={(e) => { handleChange(e); clearFieldError('applicant') }}
                  isInvalid={!!validationErrors.applicant}
                >
                  <option value="">Select applicant...</option>
                  {persons.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.first_name} {p.last_name} ({p.national_id})
                    </option>
                  ))}
                </Form.Select>
                {validationErrors.applicant && (
                  <div className="invalid-feedback d-block">
                    {validationErrors.applicant}
                  </div>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Household <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="household_id"
                  value={formData.household_id}
                  onChange={(e) => { handleChange(e); clearFieldError('household') }}
                  isInvalid={!!validationErrors.household}
                >
                  <option value="">Select household...</option>
                  {households.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.district_code} - {h.household_size} member(s)
                    </option>
                  ))}
                </Form.Select>
                {validationErrors.household && (
                  <div className="invalid-feedback d-block">
                    {validationErrors.household}
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>District Code <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="district_code"
                  value={formData.district_code}
                  onChange={(e) => { handleChange(e); clearFieldError('district') }}
                  isInvalid={!!validationErrors.district}
                >
                  <option value="">Select district...</option>
                  {DISTRICT_CODES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </Form.Select>
                {validationErrors.district && (
                  <div className="invalid-feedback d-block">
                    {validationErrors.district}
                  </div>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Requested Amount (SRD)</Form.Label>
                <Form.Control
                  type="number"
                  name="requested_amount"
                  value={formData.requested_amount}
                  onChange={(e) => { handleChange(e); clearFieldError('amount') }}
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                  isInvalid={!!validationErrors.amount}
                />
                {validationErrors.amount && (
                  <div className="invalid-feedback d-block">
                    {validationErrors.amount}
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                Saving...
              </>
            ) : subsidyCase ? (
              'Update Case'
            ) : (
              'Create Case'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default CaseFormModal

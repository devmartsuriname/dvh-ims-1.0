import { useState, useEffect } from 'react'
import { Modal, Button, Form, Spinner } from 'react-bootstrap'
import { supabase } from '@/integrations/supabase/client'
import { notify } from '@/utils/notify'
import { useAuditLog } from '@/hooks/useAuditLog'

interface Household {
  id: string
  district_code: string
  household_size: number
}

interface Person {
  id: string
  first_name: string
  last_name: string
  national_id: string
}

interface HousingRegistration {
  id: string
  reference_number: string
  household_id: string
  applicant_person_id: string
  district_code: string
  housing_type_preference: string | null
}

interface RegistrationFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  registration?: HousingRegistration
}

interface ValidationErrors {
  household?: string
  applicant?: string
  district?: string
}

const HOUSING_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'studio', label: 'Studio' },
  { value: 'duplex', label: 'Duplex' },
]

const RegistrationFormModal = ({ isOpen, onClose, onSuccess, registration }: RegistrationFormModalProps) => {
  const [households, setHouseholds] = useState<Household[]>([])
  const [members, setMembers] = useState<Person[]>([])
  const [selectedHouseholdId, setSelectedHouseholdId] = useState('')
  const [selectedApplicantId, setSelectedApplicantId] = useState('')
  const [districtCode, setDistrictCode] = useState('')
  const [housingTypePreference, setHousingTypePreference] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHouseholds, setLoadingHouseholds] = useState(true)
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [validated, setValidated] = useState(false)
  const { logEvent } = useAuditLog()

  useEffect(() => {
    if (isOpen) {
      fetchHouseholds()
      setValidationErrors({})
      setValidated(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (registration) {
      setSelectedHouseholdId(registration.household_id)
      setSelectedApplicantId(registration.applicant_person_id)
      setDistrictCode(registration.district_code)
      setHousingTypePreference(registration.housing_type_preference || '')
    } else {
      resetForm()
    }
  }, [registration, isOpen])

  useEffect(() => {
    if (selectedHouseholdId) {
      fetchHouseholdMembers(selectedHouseholdId)
      const household = households.find(h => h.id === selectedHouseholdId)
      if (household) {
        setDistrictCode(household.district_code)
      }
      // Clear household error when selected
      if (validated) {
        setValidationErrors(prev => ({ ...prev, household: undefined }))
      }
    } else {
      setMembers([])
      setSelectedApplicantId('')
    }
  }, [selectedHouseholdId, households])

  useEffect(() => {
    // Clear applicant error when selected
    if (selectedApplicantId && validated) {
      setValidationErrors(prev => ({ ...prev, applicant: undefined }))
    }
  }, [selectedApplicantId])

  const fetchHouseholds = async () => {
    setLoadingHouseholds(true)
    const { data, error } = await supabase
      .from('household')
      .select('id, district_code, household_size')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching households:', error)
    } else {
      setHouseholds(data || [])
    }
    setLoadingHouseholds(false)
  }

  const fetchHouseholdMembers = async (householdId: string) => {
    setLoadingMembers(true)
    const { data, error } = await supabase
      .from('household_member')
      .select(`
        person:person_id (
          id,
          first_name,
          last_name,
          national_id
        )
      `)
      .eq('household_id', householdId)

    if (error) {
      console.error('Error fetching members:', error)
    } else {
      const persons = data?.map(m => m.person).filter(Boolean) as Person[] || []
      setMembers(persons)
    }
    setLoadingMembers(false)
  }

  const resetForm = () => {
    setSelectedHouseholdId('')
    setSelectedApplicantId('')
    setDistrictCode('')
    setHousingTypePreference('')
    setMembers([])
    setValidationErrors({})
    setValidated(false)
  }

  const generateReferenceNumber = () => {
    const year = new Date().getFullYear()
    const random = Math.floor(1000 + Math.random() * 9000)
    return `WR-${year}-${random}`
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}
    
    if (!selectedHouseholdId) {
      errors.household = 'Household is required'
    }
    if (!selectedApplicantId) {
      errors.applicant = 'Applicant is required'
    }
    if (!districtCode) {
      errors.district = 'District is required'
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
      const referenceNumber = generateReferenceNumber()

      const { data, error } = await supabase
        .from('housing_registration')
        .insert({
          reference_number: referenceNumber,
          household_id: selectedHouseholdId,
          applicant_person_id: selectedApplicantId,
          district_code: districtCode,
          housing_type_preference: housingTypePreference || null,
          current_status: 'received',
        })
        .select()
        .single()

      if (error) throw error

      // Add initial status history
      const { data: { user } } = await supabase.auth.getUser()
      
      await supabase
        .from('housing_registration_status_history')
        .insert({
          registration_id: data.id,
          from_status: null,
          to_status: 'received',
          changed_by: user?.id,
          reason: 'Initial registration created',
        })

      await logEvent({
        action: 'CREATE',
        entity_type: 'housing_registration',
        entity_id: data.id,
        reason: `Housing registration ${referenceNumber} created`,
      })

      notify.success(`Registration ${referenceNumber} created successfully`)
      onSuccess()
      onClose()
      resetForm()
    } catch (error: any) {
      notify.error(error.message || 'Failed to create registration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={isOpen} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{registration ? 'Edit Registration' : 'New Housing Registration'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Body>
          {loadingHouseholds ? (
            <div className="text-center py-4">
              <Spinner animation="border" size="sm" />
            </div>
          ) : (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Household <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={selectedHouseholdId}
                  onChange={(e) => setSelectedHouseholdId(e.target.value)}
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

              <Form.Group className="mb-3">
                <Form.Label>Applicant <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={selectedApplicantId}
                  onChange={(e) => setSelectedApplicantId(e.target.value)}
                  disabled={!selectedHouseholdId || loadingMembers}
                  isInvalid={!!validationErrors.applicant}
                >
                  <option value="">Select applicant from household...</option>
                  {members.map((p) => (
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
                {loadingMembers && <small className="text-muted">Loading members...</small>}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>District <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={districtCode}
                  onChange={(e) => setDistrictCode(e.target.value)}
                  placeholder="Enter district code"
                  readOnly={!!selectedHouseholdId}
                  isInvalid={!!validationErrors.district}
                />
                {validationErrors.district && (
                  <div className="invalid-feedback d-block">
                    {validationErrors.district}
                  </div>
                )}
                <Form.Text className="text-muted">
                  Auto-filled from household
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Housing Type Preference</Form.Label>
                <Form.Select
                  value={housingTypePreference}
                  onChange={(e) => setHousingTypePreference(e.target.value)}
                >
                  <option value="">No preference</option>
                  {HOUSING_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading || loadingHouseholds}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Create Registration'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default RegistrationFormModal

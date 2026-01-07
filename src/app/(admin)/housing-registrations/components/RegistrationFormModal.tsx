import { useState, useEffect } from 'react'
import { Modal, Button, Form, Spinner } from 'react-bootstrap'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'react-toastify'
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
  const { logEvent } = useAuditLog()

  useEffect(() => {
    if (isOpen) {
      fetchHouseholds()
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
    } else {
      setMembers([])
      setSelectedApplicantId('')
    }
  }, [selectedHouseholdId, households])

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
  }

  const generateReferenceNumber = () => {
    const year = new Date().getFullYear()
    const random = Math.floor(1000 + Math.random() * 9000)
    return `WR-${year}-${random}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedHouseholdId || !selectedApplicantId || !districtCode) {
      toast.error('Please fill in all required fields')
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

      toast.success(`Registration ${referenceNumber} created successfully`)
      onSuccess()
      onClose()
      resetForm()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create registration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{registration ? 'Edit Registration' : 'New Housing Registration'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
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
                  required
                >
                  <option value="">Select household...</option>
                  {households.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.district_code} - {h.household_size} member(s)
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Applicant <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={selectedApplicantId}
                  onChange={(e) => setSelectedApplicantId(e.target.value)}
                  required
                  disabled={!selectedHouseholdId || loadingMembers}
                >
                  <option value="">Select applicant from household...</option>
                  {members.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.first_name} {p.last_name} ({p.national_id})
                    </option>
                  ))}
                </Form.Select>
                {loadingMembers && <small className="text-muted">Loading members...</small>}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>District <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={districtCode}
                  onChange={(e) => setDistrictCode(e.target.value)}
                  placeholder="Enter district code"
                  required
                  readOnly={!!selectedHouseholdId}
                />
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

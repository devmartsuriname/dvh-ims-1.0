import { useState, useEffect } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'react-toastify'
import { logAuditEvent } from '@/hooks/useAuditLog'

interface AssignmentFormModalProps {
  show: boolean
  onHide: () => void
  onSuccess: () => void
}

interface AllocatedRegistration {
  id: string
  reference_number: string
  district_code: string
}

const AssignmentFormModal = ({ show, onHide, onSuccess }: AssignmentFormModalProps) => {
  const [registrations, setRegistrations] = useState<AllocatedRegistration[]>([])
  const [selectedRegistration, setSelectedRegistration] = useState('')
  const [assignmentType, setAssignmentType] = useState<'internal' | 'external'>('internal')
  const [assignmentDate, setAssignmentDate] = useState('')
  const [housingReference, setHousingReference] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingRegistrations, setLoadingRegistrations] = useState(false)

  useEffect(() => {
    if (show) {
      fetchAllocatedRegistrations()
    }
  }, [show])

  const fetchAllocatedRegistrations = async () => {
    setLoadingRegistrations(true)
    
    // Fetch registrations with status 'allocated' that don't have an assignment yet
    const { data: existingAssignments } = await supabase
      .from('assignment_record')
      .select('registration_id')

    const assignedIds = existingAssignments?.map(a => a.registration_id) || []

    const { data, error } = await supabase
      .from('housing_registration')
      .select('id, reference_number, district_code')
      .eq('current_status', 'allocated')

    if (error) {
      toast.error('Failed to load registrations')
      console.error(error)
    } else {
      // Filter out already assigned registrations
      const available = (data || []).filter(r => !assignedIds.includes(r.id))
      setRegistrations(available)
    }
    setLoadingRegistrations(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Not authenticated')
        return
      }

      // Create assignment record
      const { data: newAssignment, error } = await supabase
        .from('assignment_record')
        .insert({
          registration_id: selectedRegistration,
          assignment_type: assignmentType,
          assignment_date: assignmentDate,
          housing_reference: housingReference || null,
          notes: notes || null,
          recorded_by: user.id
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // Update registration status to 'finalized'
      await supabase
        .from('housing_registration')
        .update({ current_status: 'finalized' })
        .eq('id', selectedRegistration)

      // Add status history
      await supabase
        .from('housing_registration_status_history')
        .insert({
          registration_id: selectedRegistration,
          from_status: 'allocated',
          to_status: 'finalized',
          changed_by: user.id,
          reason: `Housing assigned: ${housingReference || assignmentType} assignment`
        })

      // Log audit event
      await logAuditEvent({
        entityType: 'assignment_record',
        entityId: newAssignment.id,
        action: 'CREATE',
        metadata: {
          registration_id: selectedRegistration,
          assignment_type: assignmentType,
          housing_reference: housingReference
        }
      })

      toast.success('Assignment recorded successfully')
      
      // Reset form
      setSelectedRegistration('')
      setAssignmentType('internal')
      setAssignmentDate('')
      setHousingReference('')
      setNotes('')
      
      onSuccess()

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to record assignment'
      toast.error(message)
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Record Housing Assignment</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Registration</Form.Label>
            <Form.Select
              value={selectedRegistration}
              onChange={(e) => setSelectedRegistration(e.target.value)}
              required
              disabled={loadingRegistrations}
            >
              <option value="">
                {loadingRegistrations ? 'Loading...' : 'Select registration...'}
              </option>
              {registrations.map(r => (
                <option key={r.id} value={r.id}>
                  {r.reference_number} ({r.district_code})
                </option>
              ))}
            </Form.Select>
            {registrations.length === 0 && !loadingRegistrations && (
              <Form.Text className="text-muted">
                No allocated registrations available for assignment
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Assignment Type</Form.Label>
            <div>
              <Form.Check
                inline
                type="radio"
                label="Internal (via allocation)"
                name="assignmentType"
                id="type-internal"
                checked={assignmentType === 'internal'}
                onChange={() => setAssignmentType('internal')}
              />
              <Form.Check
                inline
                type="radio"
                label="External (manual)"
                name="assignmentType"
                id="type-external"
                checked={assignmentType === 'external'}
                onChange={() => setAssignmentType('external')}
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Assignment Date</Form.Label>
            <Form.Control
              type="date"
              value={assignmentDate}
              onChange={(e) => setAssignmentDate(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Housing Reference</Form.Label>
            <Form.Control
              type="text"
              value={housingReference}
              onChange={(e) => setHousingReference(e.target.value)}
              placeholder="e.g., Unit number, address, or reference code"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this assignment..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={saving}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            disabled={saving || !selectedRegistration}
          >
            {saving ? 'Recording...' : 'Record Assignment'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default AssignmentFormModal

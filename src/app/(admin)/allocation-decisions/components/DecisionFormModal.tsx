import { useState } from 'react'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap'
import { supabase } from '@/integrations/supabase/client'
import { notify } from '@/utils/notify'
import { logAuditEvent } from '@/hooks/useAuditLog'

interface AllocationCandidate {
  id: string
  run_id: string
  registration_id: string
  urgency_score: number
  waiting_list_position: number
  composite_rank: number
  is_selected: boolean
  registration?: {
    reference_number: string
    applicant_person_id: string
    district_code: string
  }
}

interface DecisionFormModalProps {
  show: boolean
  onHide: () => void
  candidate: AllocationCandidate | null
  onSuccess: () => void
}

const DecisionFormModal = ({ show, onHide, candidate, onSuccess }: DecisionFormModalProps) => {
  const [decision, setDecision] = useState<'approved' | 'rejected' | 'deferred'>('approved')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!candidate) return

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        notify.error('Not authenticated')
        return
      }

      // Create decision record
      const { data: newDecision, error } = await supabase
        .from('allocation_decision')
        .insert({
          run_id: candidate.run_id,
          candidate_id: candidate.id,
          registration_id: candidate.registration_id,
          decision,
          decision_reason: reason || null,
          decided_by: user.id
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      // If approved, update registration status to 'allocated'
      if (decision === 'approved') {
        await supabase
          .from('housing_registration')
          .update({ current_status: 'allocated' })
          .eq('id', candidate.registration_id)

        // Add status history
        await supabase
          .from('housing_registration_status_history')
          .insert({
            registration_id: candidate.registration_id,
            from_status: 'waiting_list',
            to_status: 'allocated',
            changed_by: user.id,
            reason: `Allocation decision: ${reason || 'Approved via allocation run'}`
          })
      }

      // Log audit event
      await logAuditEvent({
        entityType: 'allocation_decision',
        entityId: newDecision.id,
        action: 'CREATE',
        metadata: {
          candidate_id: candidate.id,
          registration_id: candidate.registration_id,
          decision,
          reason
        }
      })

      notify.success(`Decision recorded: ${decision}`)
      setDecision('approved')
      setReason('')
      onSuccess()

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save decision'
      notify.error(message)
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Make Allocation Decision</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {candidate && (
            <>
              <Row className="mb-4">
                <Col md={4}>
                  <p className="mb-1 text-muted">Reference</p>
                  <p className="fw-medium">{candidate.registration?.reference_number || '-'}</p>
                </Col>
                <Col md={4}>
                  <p className="mb-1 text-muted">District</p>
                  <p className="fw-medium">{candidate.registration?.district_code || '-'}</p>
                </Col>
                <Col md={4}>
                  <p className="mb-1 text-muted">Rank</p>
                  <p className="fw-medium">#{candidate.composite_rank}</p>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={6}>
                  <p className="mb-1 text-muted">Urgency Score</p>
                  <p className="fw-medium">{candidate.urgency_score}</p>
                </Col>
                <Col md={6}>
                  <p className="mb-1 text-muted">Waiting List Position</p>
                  <p className="fw-medium">{candidate.waiting_list_position}</p>
                </Col>
              </Row>

              <hr />

              <Form.Group className="mb-3">
                <Form.Label>Decision</Form.Label>
                <div>
                  <Form.Check
                    inline
                    type="radio"
                    label="Approve"
                    name="decision"
                    id="decision-approved"
                    checked={decision === 'approved'}
                    onChange={() => setDecision('approved')}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    label="Reject"
                    name="decision"
                    id="decision-rejected"
                    checked={decision === 'rejected'}
                    onChange={() => setDecision('rejected')}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    label="Defer"
                    name="decision"
                    id="decision-deferred"
                    checked={decision === 'deferred'}
                    onChange={() => setDecision('deferred')}
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Reason / Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for this decision..."
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Submit Decision'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default DecisionFormModal

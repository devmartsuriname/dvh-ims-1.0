import { useState } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import { toast } from 'react-toastify'
import type { CaseAssignment } from '@/hooks/useCaseAssignments'

interface RevokeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  assignment: CaseAssignment | null
  action: 'revoke' | 'complete'
  revokeAssignment: (id: string, caseId: string, userId: string, role: string, reason: string) => Promise<void>
  completeAssignment: (id: string, caseId: string, userId: string, role: string, reason: string) => Promise<void>
}

const RevokeModal = ({ isOpen, onClose, onSuccess, assignment, action, revokeAssignment, completeAssignment }: RevokeModalProps) => {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignment || !reason.trim()) {
      toast.error('Reason is required')
      return
    }

    setSubmitting(true)
    try {
      if (action === 'revoke') {
        await revokeAssignment(assignment.id, assignment.subsidy_case_id, assignment.assigned_user_id, assignment.assigned_role, reason.trim())
        toast.success('Assignment revoked')
      } else {
        await completeAssignment(assignment.id, assignment.subsidy_case_id, assignment.assigned_user_id, assignment.assigned_role, reason.trim())
        toast.success('Assignment completed')
      }
      onSuccess()
      onClose()
      setReason('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Operation failed'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{action === 'revoke' ? 'Revoke Assignment' : 'Complete Assignment'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Reason <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Mandatory justification for ${action === 'revoke' ? 'revoking' : 'completing'} this assignment...`}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant={action === 'revoke' ? 'danger' : 'success'} type="submit" disabled={submitting}>
            {submitting ? 'Processing...' : action === 'revoke' ? 'Revoke' : 'Complete'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default RevokeModal

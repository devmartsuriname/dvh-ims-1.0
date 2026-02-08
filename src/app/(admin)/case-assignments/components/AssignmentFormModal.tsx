import { useState, useEffect } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'react-toastify'

interface AssignmentFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  assignWorker: (caseId: string, userId: string, role: string, reason: string) => Promise<unknown>
}

interface CaseOption {
  id: string
  case_number: string
}

interface WorkerOption {
  user_id: string
  full_name: string
  role: string
}

const ASSIGNABLE_ROLES = ['social_field_worker', 'technical_inspector'] as const

const AssignmentFormModal = ({ isOpen, onClose, onSuccess, assignWorker }: AssignmentFormModalProps) => {
  const [cases, setCases] = useState<CaseOption[]>([])
  const [workers, setWorkers] = useState<WorkerOption[]>([])
  const [selectedCase, setSelectedCase] = useState('')
  const [selectedWorker, setSelectedWorker] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const loadData = async () => {
      // Load active subsidy cases
      const { data: caseData } = await supabase
        .from('subsidy_case')
        .select('id, case_number')
        .order('case_number')

      setCases(caseData || [])

      // Load assignable workers (users with operational roles)
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', [...ASSIGNABLE_ROLES])

      if (roleData && roleData.length > 0) {
        const userIds = [...new Set(roleData.map(r => r.user_id))]
        const { data: profiles } = await supabase
          .from('app_user_profile')
          .select('user_id, full_name')
          .in('user_id', userIds)

        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || [])
        const workerList = roleData.map(r => ({
          user_id: r.user_id,
          full_name: profileMap.get(r.user_id) || r.user_id,
          role: r.role,
        }))
        setWorkers(workerList)
      } else {
        setWorkers([])
      }
    }

    loadData()
    // Reset form
    setSelectedCase('')
    setSelectedWorker('')
    setReason('')
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCase || !selectedWorker || !reason.trim()) {
      toast.error('All fields are required')
      return
    }

    const worker = workers.find(w => w.user_id === selectedWorker)
    if (!worker) return

    setSubmitting(true)
    try {
      await assignWorker(selectedCase, selectedWorker, worker.role, reason.trim())
      toast.success('Worker assigned successfully')
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to assign worker'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Assign Worker to Case</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Subsidy Case <span className="text-danger">*</span></Form.Label>
            <Form.Select
              value={selectedCase}
              onChange={(e) => setSelectedCase(e.target.value)}
              required
            >
              <option value="">Select a case...</option>
              {cases.map(c => (
                <option key={c.id} value={c.id}>{c.case_number}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Worker <span className="text-danger">*</span></Form.Label>
            <Form.Select
              value={selectedWorker}
              onChange={(e) => setSelectedWorker(e.target.value)}
              required
            >
              <option value="">Select a worker...</option>
              {workers.map(w => (
                <option key={`${w.user_id}-${w.role}`} value={w.user_id}>
                  {w.full_name} ({w.role.replace(/_/g, ' ')})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Reason <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Mandatory justification for this assignment..."
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Assigning...' : 'Assign Worker'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default AssignmentFormModal

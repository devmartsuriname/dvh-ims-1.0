import { useState } from 'react'
import PageTitle from '@/components/PageTitle'
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Alert, Modal, Form, Button } from 'react-bootstrap'
import { Grid } from 'gridjs-react'
import { html } from 'gridjs'
import { useScheduleVisits } from '@/hooks/useScheduleVisits'
import { useUserRole } from '@/hooks/useUserRole'
import type { AppRole } from '@/hooks/useUserRole'
import { toast } from 'react-toastify'
import { VISIT_TYPE_BADGES } from '@/constants/statusBadges'

const STATUS_BADGES: Record<string, { bg: string; label: string }> = {
  in_social_review: { bg: 'info', label: 'Social Review' },
  in_technical_review: { bg: 'info', label: 'Technical Review' },
  fieldwork: { bg: 'primary', label: 'Fieldwork' },
}

const ROLE_BADGES: Record<string, { bg: string; label: string }> = {
  social_field_worker: { bg: 'info', label: 'Social Worker' },
  technical_inspector: { bg: 'warning', label: 'Technical Inspector' },
}

const VISIT_STATUS_BADGES: Record<string, { bg: string; label: string }> = {
  scheduled: { bg: 'primary', label: 'Scheduled' },
  rescheduled: { bg: 'warning', label: 'Rescheduled' },
  completed: { bg: 'success', label: 'Completed' },
  cancelled: { bg: 'danger', label: 'Cancelled' },
}

const ALLOWED_ROLES: AppRole[] = ['admin_staff', 'project_leader', 'system_admin', 'audit']
const WRITE_ROLES: AppRole[] = ['project_leader', 'system_admin']

const ScheduleVisitsPage = () => {
  const { pendingCases, fieldWorkers, scheduledVisits, loading, submitting, scheduleVisit, cancelVisit } = useScheduleVisits()
  const { roles, loading: roleLoading } = useUserRole()

  const [showModal, setShowModal] = useState(false)
  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [selectedWorker, setSelectedWorker] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedType, setSelectedType] = useState<'social' | 'technical' | 'follow_up'>('social')
  const [visitNotes, setVisitNotes] = useState('')

  if (loading || roleLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  const hasAccess = roles.some((r) => ALLOWED_ROLES.includes(r))
  const canWrite = roles.some((r) => WRITE_ROLES.includes(r))

  if (!hasAccess) {
    return (
      <>
        <PageTitle subName="Bouwsubsidie" title="Schedule Visits" />
        <Alert variant="danger">
          You do not have permission to view this page.
        </Alert>
      </>
    )
  }

  const openScheduleModal = (caseId: string) => {
    setSelectedCaseId(caseId)
    setSelectedWorker('')
    setSelectedDate('')
    setSelectedType('social')
    setVisitNotes('')
    setShowModal(true)
  }

  const handleSchedule = async () => {
    if (!selectedCaseId || !selectedWorker || !selectedDate) {
      toast.error('Please fill all required fields.')
      return
    }

    const result = await scheduleVisit({
      caseId: selectedCaseId,
      assignedTo: selectedWorker,
      scheduledDate: selectedDate,
      visitType: selectedType,
      visitNotes: visitNotes || undefined,
    })

    if (result.error) {
      toast.error(`Failed to schedule visit: ${result.error}`)
    } else {
      toast.success('Visit scheduled successfully.')
      setShowModal(false)
    }
  }

  const handleCancel = async (visitId: string) => {
    if (!confirm('Are you sure you want to cancel this visit?')) return
    const result = await cancelVisit(visitId)
    if (result.error) {
      toast.error(`Failed to cancel visit: ${result.error}`)
    } else {
      toast.success('Visit cancelled.')
    }
  }

  // Expose handlers globally for gridjs html buttons
  ;(window as any).__cancelVisit = handleCancel
  ;(window as any).__openScheduleModal = openScheduleModal

  const selectedCase = pendingCases.find((c) => c.id === selectedCaseId)

  return (
    <>
      <PageTitle subName="Bouwsubsidie" title="Schedule Visits" />
      <p className="text-muted mb-3">
        Plan and manage field inspection visits for subsidy cases.
      </p>

      {/* Scheduled Visits */}
      {scheduledVisits.length > 0 && (
        <Card className="mb-3">
          <CardHeader className="d-flex justify-content-between align-items-center">
            <CardTitle as="h5">Scheduled Visits</CardTitle>
            <span className="text-muted">{scheduledVisits.length} visit(s)</span>
          </CardHeader>
          <CardBody>
            <Grid
              data={scheduledVisits.map((v) => [
                v.case_number,
                v.applicant_name,
                v.visit_type,
                v.assigned_name,
                v.scheduled_date,
                v.visit_status,
                v.id,
              ])}
              columns={[
                { name: 'Case #' },
                { name: 'Applicant' },
                {
                  name: 'Type',
                  formatter: (cell: string) => {
                    const badge = VISIT_TYPE_BADGES[cell] || { bg: 'secondary', label: cell }
                    return html(`<span class="badge bg-${badge.bg}">${badge.label}</span>`)
                  },
                },
                { name: 'Inspector' },
                { name: 'Date' },
                {
                  name: 'Status',
                  formatter: (cell: string) => {
                    const badge = VISIT_STATUS_BADGES[cell] || { bg: 'secondary', label: cell }
                    return html(`<span class="badge bg-${badge.bg}">${badge.label}</span>`)
                  },
                },
                ...(canWrite
                  ? [{
                      name: 'Actions',
                      sort: false,
                      formatter: (cell: string) =>
                        html(`<button class="btn btn-outline-danger btn-sm" onclick="window.__cancelVisit('${cell}')">Cancel</button>`),
                    }]
                  : []),
              ]}
              pagination={{ limit: 10 }}
              sort
              className={{ table: 'table table-hover mb-0' }}
            />
          </CardBody>
        </Card>
      )}

      <Row>
        <Col lg={8}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle as="h5">Cases Pending Visits</CardTitle>
              <span className="text-muted">{pendingCases.length} case(s)</span>
            </CardHeader>
            <CardBody>
              {pendingCases.length === 0 ? (
                <p className="text-muted text-center py-4">No cases pending visits.</p>
              ) : (
                <Grid
                  data={pendingCases.map((c) => [
                    c.case_number,
                    c.applicant_name,
                    c.address,
                    c.district_code,
                    c.status,
                    c.id,
                  ])}
                  columns={[
                    { name: 'Case #' },
                    { name: 'Applicant' },
                    { name: 'Address' },
                    { name: 'District' },
                    {
                      name: 'Status',
                      formatter: (cell: string) => {
                        const badge = STATUS_BADGES[cell] || { bg: 'secondary', label: cell }
                        return html(`<span class="badge bg-${badge.bg}">${badge.label}</span>`)
                      },
                    },
                    ...(canWrite
                      ? [{
                          name: 'Actions',
                          sort: false,
                          formatter: (cell: string) =>
                            html(`<button class="btn btn-outline-primary btn-sm" onclick="window.__openScheduleModal && window.__openScheduleModal('${cell}')">Schedule</button>`),
                        }]
                      : []),
                  ]}
                  search
                  pagination={{ limit: 10 }}
                  sort
                  className={{ table: 'table table-hover mb-0' }}
                />
              )}
            </CardBody>
          </Card>
        </Col>
        <Col lg={4}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle as="h5">Available Field Workers</CardTitle>
              <span className="text-muted">{fieldWorkers.length} worker(s)</span>
            </CardHeader>
            <CardBody>
              {fieldWorkers.length === 0 ? (
                <p className="text-muted text-center py-4">No field workers found.</p>
              ) : (
                <Grid
                  data={fieldWorkers.map((w) => [
                    w.full_name,
                    w.role,
                    w.district_code,
                  ])}
                  columns={[
                    { name: 'Name' },
                    {
                      name: 'Role',
                      formatter: (cell: string) => {
                        const badge = ROLE_BADGES[cell] || { bg: 'secondary', label: cell }
                        return html(`<span class="badge bg-${badge.bg}">${badge.label}</span>`)
                      },
                    },
                    { name: 'District' },
                  ]}
                  pagination={{ limit: 10 }}
                  sort
                  className={{ table: 'table table-hover mb-0' }}
                />
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Schedule Visit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Schedule Visit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCase && (
            <Alert variant="light" className="mb-3">
              <strong>{selectedCase.case_number}</strong> — {selectedCase.applicant_name}
              <br />
              <small className="text-muted">{selectedCase.address} • {selectedCase.district_code}</small>
            </Alert>
          )}
          <Form.Group className="mb-3">
            <Form.Label>Visit Type <span className="text-danger">*</span></Form.Label>
            <Form.Select value={selectedType} onChange={(e) => setSelectedType(e.target.value as any)}>
              <option value="social">Social Visit</option>
              <option value="technical">Technical Inspection</option>
              <option value="follow_up">Follow-up Visit</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Assign Inspector <span className="text-danger">*</span></Form.Label>
            <Form.Select value={selectedWorker} onChange={(e) => setSelectedWorker(e.target.value)}>
              <option value="">Select inspector...</option>
              {fieldWorkers
                .filter((w) => {
                  if (selectedType === 'social') return w.role === 'social_field_worker'
                  if (selectedType === 'technical') return w.role === 'technical_inspector'
                  return true
                })
                .map((w) => (
                  <option key={w.user_id} value={w.user_id}>
                    {w.full_name} ({w.district_code})
                  </option>
                ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Scheduled Date <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={visitNotes}
              onChange={(e) => setVisitNotes(e.target.value)}
              placeholder="Optional notes..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSchedule} disabled={submitting}>
            {submitting ? 'Scheduling...' : 'Schedule Visit'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

// Expose modal opener globally for gridjs html buttons
;(window as any).__openScheduleModal = null

export default ScheduleVisitsPage

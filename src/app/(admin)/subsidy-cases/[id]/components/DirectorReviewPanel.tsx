import { useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Badge, Form, Button, Spinner, Modal } from 'react-bootstrap'
import { useUserRole } from '@/hooks/useUserRole'
import { useAuditLog } from '@/hooks/useAuditLog'
import { notify } from '@/utils/notify'

interface StatusHistoryEntry {
  id: string
  from_status: string | null
  to_status: string
  reason: string | null
  changed_at: string
}

interface DocumentUpload {
  id: string
  file_name: string
  is_verified: boolean
  requirement?: {
    document_name: string
    document_code: string
  }
}

interface DocumentRequirement {
  id: string
  document_code: string
  document_name: string
  is_mandatory: boolean
}

interface DirectorReviewPanelProps {
  caseId: string
  caseStatus: string
  subsidyCase: {
    case_number: string
    district_code: string
    requested_amount: number | null
    person?: { first_name: string; last_name: string; national_id: string }
    household?: { household_size: number; district_code: string }
  }
  socialReport: { id: string; report_json: any; is_finalized: boolean; finalized_at: string | null } | null
  technicalReport: { id: string; report_json: any; is_finalized: boolean; finalized_at: string | null } | null
  documents: DocumentUpload[]
  requirements: DocumentRequirement[]
  statusHistory: StatusHistoryEntry[]
  onStatusChange: (newStatus: string) => Promise<void>
  statusReason: string
  setStatusReason: (reason: string) => void
  fetchCase: () => void
}

const EDITABLE_STATUSES = ['awaiting_director_approval', 'returned_to_director']

const DirectorReviewPanel = ({
  caseId,
  caseStatus,
  subsidyCase,
  socialReport,
  technicalReport,
  documents,
  requirements,
  statusHistory,
  onStatusChange,
  statusReason,
  setStatusReason,
  fetchCase,
}: DirectorReviewPanelProps) => {
  const { hasRole } = useUserRole()
  const { logEvent } = useAuditLog()
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [modalReason, setModalReason] = useState('')
  const [processing, setProcessing] = useState(false)

  const isDirector = hasRole('director')
  const canEdit = isDirector && EDITABLE_STATUSES.includes(caseStatus)

  // Extract report summaries
  const socialJson = socialReport?.report_json as Record<string, any> | null
  const socialRecommendation = socialJson?.recommendation || ''
  const technicalJson = technicalReport?.report_json as Record<string, any> | null
  const technicalRecommendation = technicalJson?.recommendation || ''

  // Warning flags
  const socialWarning = ['unfavorable', 'needs_further_review'].includes(socialRecommendation)
  const technicalWarning = ['rejected', 'needs_revision'].includes(technicalRecommendation)

  // Document completeness
  const mandatoryReqs = requirements.filter(r => r.is_mandatory)
  const verifiedMandatory = mandatoryReqs.filter(req =>
    documents.some(d => d.requirement?.document_code === req.document_code && d.is_verified)
  )

  // Prior Director decision from history
  const priorDirectorDecision = statusHistory.find(h => h.to_status === 'director_approved')

  const handleAction = async (action: 'approve' | 'return') => {
    if (!modalReason.trim()) {
      notify.error('Motivation is mandatory')
      return
    }

    setProcessing(true)
    try {
      const newStatus = action === 'approve' ? 'director_approved' : 'returned_to_screening'
      const auditAction = action === 'approve' ? 'DIRECTOR_APPROVED' : 'DIRECTOR_RETURNED'

      // Set the reason on parent state then trigger status change
      setStatusReason(modalReason)

      // Small delay to ensure state propagation
      await new Promise(resolve => setTimeout(resolve, 50))

      await onStatusChange(newStatus)

      // Log specific audit event
      await logEvent({
        action: auditAction,
        entity_type: 'subsidy_case',
        entity_id: caseId,
        reason: modalReason,
        metadata: {
          from_status: caseStatus,
          to_status: newStatus,
          case_number: subsidyCase.case_number,
        } as any,
      })

      setShowApproveModal(false)
      setShowReturnModal(false)
      setModalReason('')
      fetchCase()
    } catch (error: any) {
      notify.error(error.message || 'Action failed')
    } finally {
      setProcessing(false)
    }
  }

  const renderRecommendationLabel = (value: string) => {
    const labels: Record<string, string> = {
      favorable: 'Favorable',
      unfavorable: 'Unfavorable',
      needs_further_review: 'Needs Further Review',
      approved: 'Approved',
      rejected: 'Rejected',
      needs_revision: 'Needs Revision',
    }
    return labels[value] || value || '—'
  }

  return (
    <>
      {/* Dossier Summary */}
      <Card className="mb-3">
        <CardHeader>
          <CardTitle as="h5">Dossier Summary</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col md={4} className="mb-3">
              <label className="form-label text-muted small">Case Number</label>
              <p className="mb-0 fw-medium">{subsidyCase.case_number}</p>
            </Col>
            <Col md={4} className="mb-3">
              <label className="form-label text-muted small">Applicant</label>
              <p className="mb-0 fw-medium">
                {subsidyCase.person?.first_name} {subsidyCase.person?.last_name}
              </p>
            </Col>
            <Col md={4} className="mb-3">
              <label className="form-label text-muted small">District</label>
              <p className="mb-0 fw-medium">{subsidyCase.district_code}</p>
            </Col>
            <Col md={4} className="mb-3">
              <label className="form-label text-muted small">Requested Amount</label>
              <p className="mb-0 fw-medium">
                {subsidyCase.requested_amount ? `SRD ${subsidyCase.requested_amount.toLocaleString()}` : '—'}
              </p>
            </Col>
            <Col md={4} className="mb-3">
              <label className="form-label text-muted small">Household Size</label>
              <p className="mb-0 fw-medium">{subsidyCase.household?.household_size || '—'} member(s)</p>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Social Report Summary */}
      <Card className="mb-3">
        <CardHeader className="d-flex justify-content-between align-items-center">
          <CardTitle as="h5" className="mb-0">Social Report Summary</CardTitle>
          <div className="d-flex gap-2">
            {socialReport?.is_finalized ? (
              <Badge bg="success">Finalized</Badge>
            ) : (
              <Badge bg="warning">Not Finalized</Badge>
            )}
            {socialWarning && <Badge bg="danger">Warning</Badge>}
          </div>
        </CardHeader>
        <CardBody>
          {socialReport ? (
            <Row>
              <Col md={4} className="mb-2">
                <label className="form-label text-muted small">Recommendation</label>
                <p className="mb-0 fw-medium">{renderRecommendationLabel(socialRecommendation)}</p>
              </Col>
              <Col md={4} className="mb-2">
                <label className="form-label text-muted small">Housing Condition</label>
                <p className="mb-0">{socialJson?.housing_condition || '—'}</p>
              </Col>
              <Col md={4} className="mb-2">
                <label className="form-label text-muted small">Income Category</label>
                <p className="mb-0">{socialJson?.income_category || '—'}</p>
              </Col>
            </Row>
          ) : (
            <p className="text-muted mb-0">No social report available.</p>
          )}
        </CardBody>
      </Card>

      {/* Technical Report Summary */}
      <Card className="mb-3">
        <CardHeader className="d-flex justify-content-between align-items-center">
          <CardTitle as="h5" className="mb-0">Technical Report Summary</CardTitle>
          <div className="d-flex gap-2">
            {technicalReport?.is_finalized ? (
              <Badge bg="success">Finalized</Badge>
            ) : (
              <Badge bg="warning">Not Finalized</Badge>
            )}
            {technicalWarning && <Badge bg="danger">Warning</Badge>}
          </div>
        </CardHeader>
        <CardBody>
          {technicalReport ? (
            <Row>
              <Col md={4} className="mb-2">
                <label className="form-label text-muted small">Recommendation</label>
                <p className="mb-0 fw-medium">{renderRecommendationLabel(technicalRecommendation)}</p>
              </Col>
              <Col md={4} className="mb-2">
                <label className="form-label text-muted small">Structural Integrity</label>
                <p className="mb-0">{technicalJson?.structural_integrity || '—'}</p>
              </Col>
              <Col md={4} className="mb-2">
                <label className="form-label text-muted small">Estimated Cost</label>
                <p className="mb-0">
                  {technicalJson?.estimated_cost ? `SRD ${Number(technicalJson.estimated_cost).toLocaleString()}` : '—'}
                </p>
              </Col>
            </Row>
          ) : (
            <p className="text-muted mb-0">No technical report available.</p>
          )}
        </CardBody>
      </Card>

      {/* Document Completeness */}
      <Card className="mb-3">
        <CardHeader>
          <CardTitle as="h5">Document Completeness</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="mb-0">
            <Badge bg={verifiedMandatory.length === mandatoryReqs.length ? 'success' : 'warning'}>
              {verifiedMandatory.length} / {mandatoryReqs.length}
            </Badge>
            <span className="ms-2">mandatory documents verified</span>
          </p>
        </CardBody>
      </Card>

      {/* Director Decision */}
      <Card className="mb-3">
        <CardHeader>
          <div>
            <CardTitle as="h5" className="mb-1">Director Review & Decision</CardTitle>
            <small className="text-muted">
              This review panel supports the organizational approval step. Status transitions remain manual and role-controlled.
            </small>
          </div>
        </CardHeader>
        <CardBody>
          {/* Show prior decision if exists and not in editable state */}
          {priorDirectorDecision && !canEdit && (
            <div className="mb-3 p-3 border rounded bg-light">
              <label className="form-label text-muted small">Prior Director Decision</label>
              <p className="mb-1">
                <Badge bg="success">Approved</Badge>
                <small className="text-muted ms-2">
                  {new Date(priorDirectorDecision.changed_at).toLocaleString()}
                </small>
              </p>
              {priorDirectorDecision.reason && (
                <p className="mb-0 small">{priorDirectorDecision.reason}</p>
              )}
            </div>
          )}

          {canEdit ? (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Decision Motivation <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Provide motivation for your decision..."
                />
              </Form.Group>
              <div className="d-flex gap-2">
                <Button
                  variant="success"
                  onClick={() => {
                    setModalReason(statusReason)
                    setShowApproveModal(true)
                  }}
                  disabled={!statusReason.trim()}
                >
                  Approve — Proceed to Ministerial Advice
                </Button>
                <Button
                  variant="outline-warning"
                  onClick={() => {
                    setModalReason(statusReason)
                    setShowReturnModal(true)
                  }}
                  disabled={!statusReason.trim()}
                >
                  Return to Screening
                </Button>
              </div>
            </>
          ) : !priorDirectorDecision ? (
            <p className="text-muted mb-0">
              {isDirector
                ? 'This case is not currently awaiting Director approval.'
                : 'Director review is read-only for your role.'}
            </p>
          ) : null}
        </CardBody>
      </Card>

      {/* Approve Confirmation Modal */}
      <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Confirm Director Approval</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-danger mb-3">
            This action will approve the dossier for the ministerial advisory phase. This decision is immutable and will be recorded in the audit trail.
          </p>
          <Form.Group>
            <Form.Label>Motivation <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={modalReason}
              onChange={(e) => setModalReason(e.target.value)}
              placeholder="Confirm your motivation..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApproveModal(false)} disabled={processing}>
            Cancel
          </Button>
          <Button variant="success" onClick={() => handleAction('approve')} disabled={!modalReason.trim() || processing}>
            {processing ? (
              <><Spinner animation="border" size="sm" className="me-1" />Processing...</>
            ) : (
              'Confirm Approval'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Return Confirmation Modal */}
      <Modal show={showReturnModal} onHide={() => setShowReturnModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Return to Screening</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-warning mb-3">
            This action will return the dossier to the screening phase. This decision is immutable and will be recorded in the audit trail.
          </p>
          <Form.Group>
            <Form.Label>Motivation <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={modalReason}
              onChange={(e) => setModalReason(e.target.value)}
              placeholder="Provide reason for returning..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReturnModal(false)} disabled={processing}>
            Cancel
          </Button>
          <Button variant="warning" onClick={() => handleAction('return')} disabled={!modalReason.trim() || processing}>
            {processing ? (
              <><Spinner animation="border" size="sm" className="me-1" />Processing...</>
            ) : (
              'Confirm Return'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default DirectorReviewPanel

import { useState, useMemo } from 'react'
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

interface MinisterDecisionPanelProps {
  caseId: string
  caseStatus: string
  subsidyCase: {
    case_number: string
    district_code: string
    requested_amount: number | null
    person?: { first_name: string; last_name: string; national_id: string }
    household?: { household_size: number; district_code: string }
  }
  socialReport: { id: string; report_json: any; is_finalized: boolean } | null
  technicalReport: { id: string; report_json: any; is_finalized: boolean } | null
  statusHistory: StatusHistoryEntry[]
  onStatusChange: (newStatus: string) => Promise<void>
  statusReason: string
  setStatusReason: (reason: string) => void
  fetchCase: () => void
}

const MinisterDecisionPanel = ({
  caseId,
  caseStatus,
  subsidyCase,
  socialReport,
  technicalReport,
  statusHistory,
  onStatusChange,
  statusReason,
  setStatusReason,
  fetchCase,
}: MinisterDecisionPanelProps) => {
  const { hasRole } = useUserRole()
  const { logEvent } = useAuditLog()
  const [motivation, setMotivation] = useState('')
  const [deviationExplanation, setDeviationExplanation] = useState('')
  const [pendingAction, setPendingAction] = useState<'approve' | 'return' | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalReason, setModalReason] = useState('')
  const [processing, setProcessing] = useState(false)

  const isMinister = hasRole('minister')
  const canEdit = isMinister && caseStatus === 'awaiting_minister_decision'

  // Extract report summaries
  const socialJson = socialReport?.report_json as Record<string, any> | null
  const technicalJson = technicalReport?.report_json as Record<string, any> | null

  // Director decision from history
  const directorDecision = statusHistory.find(h => h.to_status === 'director_approved')

  // Advisor advice from history
  const advisorAdvice = statusHistory.find(h => h.to_status === 'ministerial_advice_complete')

  // Parse advisor recommendation from reason string: "[Recommendation: X] advice text"
  const advisorRecommendation = useMemo(() => {
    if (!advisorAdvice?.reason) return null
    const match = advisorAdvice.reason.match(/^\[Recommendation: (.+?)\]/)
    return match ? match[1] : null
  }, [advisorAdvice])

  // Prior minister decision (for read-only view)
  const priorMinisterDecision = statusHistory.find(h => h.to_status === 'minister_approved')

  // Deviation detection
  const isDeviation = useMemo(() => {
    if (!pendingAction || !advisorRecommendation) return false
    const advisorRecommendsApproval = advisorRecommendation.toLowerCase().includes('approval')
    const advisorRecommendsRejection = advisorRecommendation.toLowerCase().includes('rejection')

    if (pendingAction === 'approve' && advisorRecommendsRejection) return true
    if (pendingAction === 'return' && advisorRecommendsApproval) return true
    return false
  }, [pendingAction, advisorRecommendation])

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

  const openConfirmation = (action: 'approve' | 'return') => {
    setPendingAction(action)
    setModalReason(motivation)
    setShowModal(true)
  }

  const handleAction = async () => {
    if (!modalReason.trim()) {
      notify.error('Motivation is mandatory')
      return
    }
    if (isDeviation && !deviationExplanation.trim()) {
      notify.error('Deviation explanation is mandatory when deviating from advisory recommendation')
      return
    }

    setProcessing(true)
    try {
      const newStatus = pendingAction === 'approve' ? 'minister_approved' : 'returned_to_advisor'
      const auditAction = pendingAction === 'approve' ? 'MINISTER_APPROVED' : 'MINISTER_RETURNED'

      // Build reason with deviation if applicable
      let reason = modalReason
      if (isDeviation && deviationExplanation.trim()) {
        reason = `${modalReason}. DEVIATION FROM ADVISORY: ${deviationExplanation}`
      }

      setStatusReason(reason)
      await new Promise(resolve => setTimeout(resolve, 50))
      await onStatusChange(newStatus)

      await logEvent({
        action: auditAction as any,
        entity_type: 'subsidy_case',
        entity_id: caseId,
        reason,
        metadata: {
          from_status: caseStatus,
          to_status: newStatus,
          case_number: subsidyCase.case_number,
          advisor_recommendation: advisorRecommendation,
          is_deviation: isDeviation,
        } as any,
      })

      setShowModal(false)
      setModalReason('')
      setMotivation('')
      setDeviationExplanation('')
      setPendingAction(null)
      fetchCase()
    } catch (error: any) {
      notify.error(error.message || 'Action failed')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <>
      {/* Consolidated Decision Chain Summary */}
      <Card className="mb-3">
        <CardHeader>
          <CardTitle as="h5">Decision Chain Summary</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            {/* Social Recommendation */}
            <Col md={6} className="mb-3">
              <div className="p-3 border rounded">
                <label className="form-label text-muted small">Social Report Recommendation</label>
                <p className="mb-0 fw-medium">
                  {renderRecommendationLabel(socialJson?.recommendation || '')}
                  {socialReport?.is_finalized && <Badge bg="success" className="ms-2">Finalized</Badge>}
                </p>
              </div>
            </Col>

            {/* Technical Recommendation */}
            <Col md={6} className="mb-3">
              <div className="p-3 border rounded">
                <label className="form-label text-muted small">Technical Report Recommendation</label>
                <p className="mb-0 fw-medium">
                  {renderRecommendationLabel(technicalJson?.recommendation || '')}
                  {technicalReport?.is_finalized && <Badge bg="success" className="ms-2">Finalized</Badge>}
                </p>
              </div>
            </Col>

            {/* Director Approval */}
            <Col md={6} className="mb-3">
              <div className="p-3 border rounded">
                <label className="form-label text-muted small">Director Approval</label>
                {directorDecision ? (
                  <>
                    <p className="mb-1">
                      <Badge bg="success">Approved</Badge>
                      <small className="text-muted ms-2">{new Date(directorDecision.changed_at).toLocaleString()}</small>
                    </p>
                    {directorDecision.reason && <p className="mb-0 small">{directorDecision.reason}</p>}
                  </>
                ) : (
                  <p className="mb-0 text-muted">Not yet recorded</p>
                )}
              </div>
            </Col>

            {/* Advisor Recommendation */}
            <Col md={6} className="mb-3">
              <div className="p-3 border rounded">
                <label className="form-label text-muted small">Ministerial Advisor Recommendation</label>
                {advisorAdvice ? (
                  <>
                    <p className="mb-1">
                      <Badge bg="info">{advisorRecommendation || 'Submitted'}</Badge>
                      <small className="text-muted ms-2">{new Date(advisorAdvice.changed_at).toLocaleString()}</small>
                    </p>
                    {advisorAdvice.reason && <p className="mb-0 small">{advisorAdvice.reason}</p>}
                  </>
                ) : (
                  <p className="mb-0 text-muted">Not yet recorded</p>
                )}
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Minister Decision */}
      <Card className="mb-3">
        <CardHeader>
          <div>
            <CardTitle as="h5" className="mb-1">Minister Decision</CardTitle>
            <small className="text-muted">
              This panel supports the final ministerial decision. The Minister's approval is the last gate before Raadvoorstel generation. All decisions are immutable.
            </small>
          </div>
        </CardHeader>
        <CardBody>
          {/* Show prior decision if exists and not in editable state */}
          {priorMinisterDecision && !canEdit && (
            <div className="mb-3 p-3 border rounded bg-light">
              <label className="form-label text-muted small">Prior Minister Decision</label>
              <p className="mb-1">
                <Badge bg="success">Approved</Badge>
                <small className="text-muted ms-2">
                  {new Date(priorMinisterDecision.changed_at).toLocaleString()}
                </small>
              </p>
              {priorMinisterDecision.reason && (
                <p className="mb-0 small">{priorMinisterDecision.reason}</p>
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
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder="Provide your decision motivation..."
                />
              </Form.Group>

              <div className="d-flex gap-2 mb-3">
                <Button
                  variant="success"
                  onClick={() => openConfirmation('approve')}
                  disabled={!motivation.trim()}
                >
                  Approve — Proceed to Council
                </Button>
                <Button
                  variant="outline-warning"
                  onClick={() => openConfirmation('return')}
                  disabled={!motivation.trim()}
                >
                  Return to Advisor
                </Button>
              </div>
            </>
          ) : !priorMinisterDecision ? (
            <p className="text-muted mb-0">
              {isMinister
                ? 'This case is not currently awaiting a Minister decision.'
                : 'Minister decision is read-only for your role.'}
            </p>
          ) : null}
        </CardBody>
      </Card>

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {pendingAction === 'approve' ? 'Confirm Minister Approval' : 'Confirm Return to Advisor'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className={pendingAction === 'approve' ? 'text-danger mb-3' : 'text-warning mb-3'}>
            {pendingAction === 'approve'
              ? 'This action will grant final ministerial approval. The case will proceed to Raadvoorstel generation. This decision is immutable.'
              : 'This action will return the dossier to the Ministerial Advisor for re-review. This decision is immutable.'}
          </p>

          <Form.Group className="mb-3">
            <Form.Label>Motivation <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={modalReason}
              onChange={(e) => setModalReason(e.target.value)}
              placeholder="Confirm your motivation..."
            />
          </Form.Group>

          {/* Deviation Detection */}
          {isDeviation && (
            <div className="border border-danger rounded p-3 mb-3">
              <h6 className="text-danger mb-2">
                ⚠ Deviation from Advisory Recommendation
              </h6>
              <p className="small text-muted mb-2">
                Your decision differs from the Ministerial Advisor's recommendation ({advisorRecommendation}).
                A mandatory explanation is required and will be permanently recorded in the audit trail.
              </p>
              <Form.Group>
                <Form.Label>Deviation Explanation <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={deviationExplanation}
                  onChange={(e) => setDeviationExplanation(e.target.value)}
                  placeholder="Explain why your decision deviates from the advisory recommendation..."
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={processing}>
            Cancel
          </Button>
          <Button
            variant={pendingAction === 'approve' ? 'success' : 'warning'}
            onClick={handleAction}
            disabled={!modalReason.trim() || (isDeviation && !deviationExplanation.trim()) || processing}
          >
            {processing ? (
              <><Spinner animation="border" size="sm" className="me-1" />Processing...</>
            ) : (
              pendingAction === 'approve' ? 'Confirm Approval' : 'Confirm Return'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default MinisterDecisionPanel

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

interface AdvisorReviewPanelProps {
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

const EDITABLE_STATUSES = ['in_ministerial_advice', 'returned_to_advisor']

const ADVISOR_RECOMMENDATIONS = [
  { value: '', label: '-- Select Recommendation --' },
  { value: 'recommend_approval', label: 'Recommend Approval' },
  { value: 'recommend_rejection', label: 'Recommend Rejection' },
  { value: 'recommend_return', label: 'Recommend Return' },
]

const AdvisorReviewPanel = ({
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
}: AdvisorReviewPanelProps) => {
  const { hasRole } = useUserRole()
  const { logEvent } = useAuditLog()
  const [recommendation, setRecommendation] = useState('')
  const [adviceText, setAdviceText] = useState('')
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [modalReason, setModalReason] = useState('')
  const [processing, setProcessing] = useState(false)

  const isAdvisor = hasRole('ministerial_advisor')
  const canEdit = isAdvisor && EDITABLE_STATUSES.includes(caseStatus)

  // Extract report summaries
  const socialJson = socialReport?.report_json as Record<string, any> | null
  const technicalJson = technicalReport?.report_json as Record<string, any> | null

  // Director's prior decision
  const directorDecision = statusHistory.find(h => h.to_status === 'director_approved')

  // Prior advisor advice (for read-only view after submission)
  const priorAdvice = statusHistory.find(h => h.to_status === 'ministerial_advice_complete')

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

  const buildReasonString = (): string => {
    const recLabel = ADVISOR_RECOMMENDATIONS.find(r => r.value === recommendation)?.label || recommendation
    return `[Recommendation: ${recLabel}] ${adviceText}`
  }

  const handleAction = async (action: 'submit' | 'return') => {
    if (!modalReason.trim()) {
      notify.error('Motivation is mandatory')
      return
    }

    setProcessing(true)
    try {
      let newStatus: string
      let auditAction: string
      let reason: string

      if (action === 'submit') {
        newStatus = 'ministerial_advice_complete'
        auditAction = 'MINISTERIAL_ADVICE_COMPLETED'
        reason = buildReasonString()
      } else {
        newStatus = 'returned_to_director'
        auditAction = 'MINISTERIAL_ADVICE_RETURNED'
        reason = modalReason
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
          ...(action === 'submit' ? { recommendation } : {}),
        } as any,
      })

      setShowSubmitModal(false)
      setShowReturnModal(false)
      setModalReason('')
      setRecommendation('')
      setAdviceText('')
      fetchCase()
    } catch (error: any) {
      notify.error(error.message || 'Action failed')
    } finally {
      setProcessing(false)
    }
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

      {/* Social + Technical Summary */}
      <Row className="mb-3">
        <Col md={6}>
          <Card className="h-100">
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle as="h5" className="mb-0">Social Report</CardTitle>
              {socialReport?.is_finalized ? <Badge bg="success">Finalized</Badge> : <Badge bg="warning">Not Finalized</Badge>}
            </CardHeader>
            <CardBody>
              <label className="form-label text-muted small">Recommendation</label>
              <p className="mb-0 fw-medium">{renderRecommendationLabel(socialJson?.recommendation || '')}</p>
            </CardBody>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle as="h5" className="mb-0">Technical Report</CardTitle>
              {technicalReport?.is_finalized ? <Badge bg="success">Finalized</Badge> : <Badge bg="warning">Not Finalized</Badge>}
            </CardHeader>
            <CardBody>
              <label className="form-label text-muted small">Recommendation</label>
              <p className="mb-0 fw-medium">{renderRecommendationLabel(technicalJson?.recommendation || '')}</p>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Director Approval Confirmation */}
      <Card className="mb-3">
        <CardHeader>
          <CardTitle as="h5">Director Approval</CardTitle>
        </CardHeader>
        <CardBody>
          {directorDecision ? (
            <div className="p-3 border rounded bg-light">
              <p className="mb-1">
                <Badge bg="success">Approved by Director</Badge>
                <small className="text-muted ms-2">
                  {new Date(directorDecision.changed_at).toLocaleString()}
                </small>
              </p>
              {directorDecision.reason && (
                <p className="mb-0 small">{directorDecision.reason}</p>
              )}
            </div>
          ) : (
            <p className="text-muted mb-0">No Director approval recorded yet.</p>
          )}
        </CardBody>
      </Card>

      {/* Advisor Decision */}
      <Card className="mb-3">
        <CardHeader>
          <div>
            <CardTitle as="h5" className="mb-1">Ministerial Advisor — Formal Advice</CardTitle>
            <small className="text-muted">
              This panel supports the advisory step. The advisor's recommendation informs the Minister's decision but does not constitute approval or rejection.
            </small>
          </div>
        </CardHeader>
        <CardBody>
          {/* Show prior advice if exists and not in editable state */}
          {priorAdvice && !canEdit && (
            <div className="mb-3 p-3 border rounded bg-light">
              <label className="form-label text-muted small">Prior Advisor Advice</label>
              <p className="mb-1">
                <Badge bg="info">Advice Submitted</Badge>
                <small className="text-muted ms-2">
                  {new Date(priorAdvice.changed_at).toLocaleString()}
                </small>
              </p>
              {priorAdvice.reason && (
                <p className="mb-0 small">{priorAdvice.reason}</p>
              )}
            </div>
          )}

          {canEdit ? (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Recommendation <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                >
                  {ADVISOR_RECOMMENDATIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Formal Advice <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={adviceText}
                  onChange={(e) => setAdviceText(e.target.value)}
                  placeholder="Provide your formal advisory opinion..."
                />
              </Form.Group>

              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  onClick={() => {
                    setModalReason(buildReasonString())
                    setShowSubmitModal(true)
                  }}
                  disabled={!recommendation || !adviceText.trim()}
                >
                  Submit Advice
                </Button>
                <Button
                  variant="outline-warning"
                  onClick={() => {
                    setModalReason('')
                    setShowReturnModal(true)
                  }}
                >
                  Return to Director
                </Button>
              </div>
            </>
          ) : !priorAdvice ? (
            <p className="text-muted mb-0">
              {isAdvisor
                ? 'This case is not currently in the ministerial advice phase.'
                : 'Ministerial advice is read-only for your role.'}
            </p>
          ) : null}
        </CardBody>
      </Card>

      {/* Submit Advice Confirmation Modal */}
      <Modal show={showSubmitModal} onHide={() => setShowSubmitModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Confirm Advisory Submission</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-danger mb-3">
            This action will submit your formal advisory opinion. This advice is immutable and will be recorded in the audit trail for the Minister's review.
          </p>
          <div className="p-3 border rounded bg-light mb-3">
            <label className="form-label text-muted small">Your Recommendation</label>
            <p className="mb-1 fw-medium">
              {ADVISOR_RECOMMENDATIONS.find(r => r.value === recommendation)?.label}
            </p>
            <label className="form-label text-muted small mt-2">Your Advice</label>
            <p className="mb-0 small">{adviceText}</p>
          </div>
          <Form.Group>
            <Form.Label>Confirm motivation <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={modalReason}
              onChange={(e) => setModalReason(e.target.value)}
              placeholder="Confirm your advisory motivation..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSubmitModal(false)} disabled={processing}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => handleAction('submit')} disabled={!modalReason.trim() || processing}>
            {processing ? (
              <><Spinner animation="border" size="sm" className="me-1" />Processing...</>
            ) : (
              'Confirm Submission'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Return to Director Confirmation Modal */}
      <Modal show={showReturnModal} onHide={() => setShowReturnModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Return to Director</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-warning mb-3">
            This action will return the dossier to the Director for re-review. This decision is immutable and will be recorded in the audit trail.
          </p>
          <Form.Group>
            <Form.Label>Motivation <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={modalReason}
              onChange={(e) => setModalReason(e.target.value)}
              placeholder="Provide reason for returning to Director..."
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

export default AdvisorReviewPanel

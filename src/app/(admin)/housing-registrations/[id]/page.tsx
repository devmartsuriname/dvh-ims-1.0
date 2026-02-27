import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Button, Spinner, Badge, Tab, Tabs, Form, Table } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { supabase } from '@/integrations/supabase/client'
import { HOUSING_DOCUMENT_REQUIREMENTS } from '@/config/documentRequirements'
import { notify } from '@/utils/notify'
import { useAuditLog } from '@/hooks/useAuditLog'
import { createAdminNotification } from '@/hooks/useAdminNotifications'
import UrgencyAssessmentForm from '../components/UrgencyAssessmentForm'

interface HousingRegistration {
  id: string
  reference_number: string
  household_id: string
  applicant_person_id: string
  district_code: string
  current_status: string
  registration_date: string
  housing_type_preference: string | null
  urgency_score: number | null
  waiting_list_position: number | null
  assigned_officer_id: string | null
  created_at: string
  updated_at: string
  person?: {
    first_name: string
    last_name: string
    national_id: string
  }
  household?: {
    household_size: number
    district_code: string
  }
}

interface StatusHistory {
  id: string
  from_status: string | null
  to_status: string
  reason: string | null
  changed_at: string
}

interface UrgencyAssessment {
  id: string
  urgency_category: string
  urgency_points: number
  assessed_by: string | null
  assessment_date: string
  justification: string | null
}

interface DocumentUpload {
  id: string
  file_path: string
  file_name: string
  is_verified: boolean
  verified_by: string | null
  verified_at: string | null
  uploaded_at: string
  requirement: {
    document_name: string
    document_code: string
    is_mandatory: boolean
  }
}

const STATUS_BADGES: Record<string, { bg: string; label: string }> = {
  received: { bg: 'secondary', label: 'Received' },
  under_review: { bg: 'info', label: 'Under Review' },
  urgency_assessed: { bg: 'primary', label: 'Urgency Assessed' },
  waiting_list: { bg: 'warning', label: 'Waiting List' },
  matched: { bg: 'success', label: 'Matched' },
  allocated: { bg: 'dark', label: 'Allocated' },
  finalized: { bg: 'success', label: 'Finalized' },
  rejected: { bg: 'danger', label: 'Rejected' },
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
  received: ['under_review', 'rejected'],
  under_review: ['urgency_assessed', 'rejected'],
  urgency_assessed: ['waiting_list', 'rejected'],
  waiting_list: ['matched', 'rejected'],
  matched: ['allocated', 'rejected'],
  allocated: ['finalized', 'rejected'],
}

const HousingRegistrationDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [registration, setRegistration] = useState<HousingRegistration | null>(null)
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([])
  const [urgencyAssessments, setUrgencyAssessments] = useState<UrgencyAssessment[]>([])
  const [documents, setDocuments] = useState<DocumentUpload[]>([])
  const [loading, setLoading] = useState(true)
  const [statusLoading, setStatusLoading] = useState(false)
  const [verifyingDocId, setVerifyingDocId] = useState<string | null>(null)
  const [statusReason, setStatusReason] = useState('')
  const { logEvent } = useAuditLog()

  const fetchRegistration = async () => {
    if (!id) return

    setLoading(true)
    
    const [regRes, historyRes, urgencyRes, docsRes] = await Promise.all([
      supabase
        .from('housing_registration')
        .select(`
          *,
          person:applicant_person_id (first_name, last_name, national_id),
          household:household_id (household_size, district_code)
        `)
        .eq('id', id)
        .single(),
      supabase
        .from('housing_registration_status_history')
        .select('*')
        .eq('registration_id', id)
        .order('changed_at', { ascending: false }),
      supabase
        .from('housing_urgency')
        .select('*')
        .eq('registration_id', id)
        .order('assessment_date', { ascending: false }),
      supabase
        .from('housing_document_upload')
        .select(`
          id,
          file_path,
          file_name,
          is_verified,
          verified_by,
          verified_at,
          uploaded_at,
          requirement:requirement_id (document_name, document_code, is_mandatory)
        `)
        .eq('registration_id', id)
        .order('uploaded_at', { ascending: false })
    ])

    if (regRes.error) {
      notify.error('Registration not found')
      navigate('/housing-registrations')
      return
    }

    setRegistration(regRes.data)
    setStatusHistory(historyRes.data || [])
    setUrgencyAssessments(urgencyRes.data || [])
    setDocuments((docsRes.data as unknown as DocumentUpload[]) || [])
    setLoading(false)
  }

  const handleDocumentVerification = async (docId: string, currentVerified: boolean) => {
    if (!registration) return

    setVerifyingDocId(docId)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const newVerified = !currentVerified

      const { error } = await supabase
        .from('housing_document_upload')
        .update({
          is_verified: newVerified,
          verified_by: newVerified ? user?.id : null,
          verified_at: newVerified ? new Date().toISOString() : null,
        })
        .eq('id', docId)

      if (error) throw error

      await logEvent({
        action: 'DOCUMENT_VERIFIED',
        entity_type: 'housing_document_upload',
        entity_id: docId,
        reason: newVerified ? 'Document marked as verified' : 'Document verification removed',
      })

      notify.success(newVerified ? 'Document verified' : 'Verification removed')
      fetchRegistration()
    } catch (error: any) {
      notify.error(error.message || 'Failed to update verification')
    } finally {
      setVerifyingDocId(null)
    }
  }

  const getDocumentUrl = (filePath: string) => {
    const { data } = supabase.storage.from('citizen-uploads').getPublicUrl(filePath)
    return data.publicUrl
  }

  useEffect(() => {
    fetchRegistration()
  }, [id])

  const handleStatusChange = async (newStatus: string) => {
    if (!registration || !statusReason.trim()) {
      notify.error('Please provide a reason for the status change')
      return
    }

    setStatusLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Generate correlation ID for audit trail linkage
      const correlationId = crypto.randomUUID()

      const { error: updateError } = await supabase
        .from('housing_registration')
        .update({ current_status: newStatus })
        .eq('id', registration.id)

      if (updateError) throw updateError

      const { error: historyError } = await supabase
        .from('housing_registration_status_history')
        .insert({
          registration_id: registration.id,
          from_status: registration.current_status,
          to_status: newStatus,
          changed_by: user?.id,
          reason: statusReason,
        })

      if (historyError) throw historyError

      await logEvent({
        action: 'STATUS_CHANGE',
        entity_type: 'housing_registration',
        entity_id: registration.id,
        reason: `Status changed from ${registration.current_status} to ${newStatus}: ${statusReason}`,
      })

      // Create admin notification for status change (S-03)
      await createAdminNotification({
        recipientRole: 'frontdesk_housing',
        districtCode: registration.district_code,
        notificationType: 'status_change',
        title: `Registration ${registration.reference_number} Updated`,
        message: `Status changed to ${STATUS_BADGES[newStatus]?.label || newStatus}`,
        entityType: 'housing_registration',
        entityId: registration.id,
        correlationId,
      })

      notify.success(`Status changed to ${STATUS_BADGES[newStatus]?.label || newStatus}`)
      setStatusReason('')
      fetchRegistration()
    } catch (error: any) {
      notify.error(error.message || 'Failed to update status')
    } finally {
      setStatusLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <PageTitle subName="Woning Registratie" title="Registration Detail" />
        <Card>
          <CardBody className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </CardBody>
        </Card>
      </>
    )
  }

  if (!registration) {
    return (
      <>
        <PageTitle subName="Woning Registratie" title="Registration Detail" />
        <Card>
          <CardBody className="text-center py-5">
            <p className="text-muted">Registration not found</p>
            <Button variant="primary" onClick={() => navigate('/housing-registrations')}>
              Back to Registrations
            </Button>
          </CardBody>
        </Card>
      </>
    )
  }

  const allowedTransitions = STATUS_TRANSITIONS[registration.current_status] || []
  const badge = STATUS_BADGES[registration.current_status] || { bg: 'secondary', label: registration.current_status }

  return (
    <>
      <PageTitle subName="Woning Registratie" title="Registration Detail" />

      <Card className="mb-3">
        <CardHeader className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <CardTitle as="h5" className="mb-0">{registration.reference_number}</CardTitle>
            <Badge bg={badge.bg}>{badge.label}</Badge>
          </div>
          <Button variant="outline-secondary" size="sm" onClick={() => navigate('/housing-registrations')}>
            <IconifyIcon icon="mingcute:arrow-left-line" className="me-1" />
            Back
          </Button>
        </CardHeader>
      </Card>

      <Tabs defaultActiveKey="overview" className="mb-3">
        {/* Overview Tab */}
        <Tab eventKey="overview" title="Overview">
          <Row>
            <Col lg={8}>
              <Card>
                <CardHeader>
                  <CardTitle as="h5">Registration Information</CardTitle>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col md={6} className="mb-3">
                      <label className="form-label text-muted small">Reference Number</label>
                      <p className="mb-0 fw-medium">{registration.reference_number}</p>
                    </Col>
                    <Col md={6} className="mb-3">
                      <label className="form-label text-muted small">District</label>
                      <p className="mb-0 fw-medium">{registration.district_code}</p>
                    </Col>
                    <Col md={6} className="mb-3">
                      <label className="form-label text-muted small">Applicant</label>
                      <p className="mb-0 fw-medium">
                        {registration.person?.first_name} {registration.person?.last_name}
                        <br />
                        <small className="text-muted">{registration.person?.national_id}</small>
                      </p>
                    </Col>
                    <Col md={6} className="mb-3">
                      <label className="form-label text-muted small">Household Size</label>
                      <p className="mb-0 fw-medium">{registration.household?.household_size} member(s)</p>
                    </Col>
                    <Col md={6} className="mb-3">
                      <label className="form-label text-muted small">Housing Preference</label>
                      <p className="mb-0 fw-medium">{registration.housing_type_preference || '-'}</p>
                    </Col>
                    <Col md={6} className="mb-3">
                      <label className="form-label text-muted small">Urgency Score</label>
                      <p className="mb-0 fw-medium">{registration.urgency_score ?? '-'}</p>
                    </Col>
                    <Col md={6} className="mb-3">
                      <label className="form-label text-muted small">Waiting List Position</label>
                      <p className="mb-0 fw-medium">{registration.waiting_list_position ?? '-'}</p>
                    </Col>
                    <Col md={6} className="mb-3">
                      <label className="form-label text-muted small">Registration Date</label>
                      <p className="mb-0 fw-medium">{new Date(registration.registration_date).toLocaleString()}</p>
                    </Col>
                    <Col md={6} className="mb-3">
                      <label className="form-label text-muted small">Created</label>
                      <p className="mb-0 fw-medium">{new Date(registration.created_at).toLocaleString()}</p>
                    </Col>
                    <Col md={6} className="mb-3">
                      <label className="form-label text-muted small">Last Updated</label>
                      <p className="mb-0 fw-medium">{new Date(registration.updated_at).toLocaleString()}</p>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
            <Col lg={4}>
              <Card>
                <CardHeader>
                  <CardTitle as="h5">Change Status</CardTitle>
                </CardHeader>
                <CardBody>
                  {allowedTransitions.length === 0 ? (
                    <p className="text-muted text-center py-2">No status changes available</p>
                  ) : (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>Reason for change <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={statusReason}
                          onChange={(e) => setStatusReason(e.target.value)}
                          placeholder="Enter reason..."
                        />
                      </Form.Group>
                      <div className="d-flex flex-wrap gap-2">
                        {allowedTransitions.map((status) => (
                          <Button
                            key={status}
                            variant={status === 'rejected' ? 'outline-danger' : 'outline-primary'}
                            size="sm"
                            onClick={() => handleStatusChange(status)}
                            disabled={statusLoading || !statusReason.trim()}
                          >
                            {STATUS_BADGES[status]?.label || status}
                          </Button>
                        ))}
                      </div>
                    </>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* Urgency Tab */}
        <Tab eventKey="urgency" title="Urgency">
          <UrgencyAssessmentForm
            registrationId={registration.id}
            assessments={urgencyAssessments}
            onAssessmentAdded={fetchRegistration}
          />
        </Tab>

        {/* History Tab */}
        <Tab eventKey="history" title="History">
          <Card>
            <CardHeader>
              <CardTitle as="h5">Status History</CardTitle>
            </CardHeader>
            <CardBody>
              {statusHistory.length === 0 ? (
                <p className="text-muted text-center py-4">No status history</p>
              ) : (
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th>From</th>
                      <th>To</th>
                      <th>Reason</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusHistory.map((h) => (
                      <tr key={h.id}>
                        <td>
                          {h.from_status ? (
                            <Badge bg={STATUS_BADGES[h.from_status]?.bg || 'secondary'}>
                              {STATUS_BADGES[h.from_status]?.label || h.from_status}
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>
                          <Badge bg={STATUS_BADGES[h.to_status]?.bg || 'secondary'}>
                            {STATUS_BADGES[h.to_status]?.label || h.to_status}
                          </Badge>
                        </td>
                        <td>{h.reason || '-'}</td>
                        <td>{new Date(h.changed_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Tab>

        {/* Documents Tab */}
        <Tab eventKey="documents" title={`Documents (${documents.length})`}>
          <Row>
            <Col lg={8}>
              <Card>
                <CardHeader>
                  <CardTitle as="h5">Uploaded Documents</CardTitle>
                </CardHeader>
                <CardBody>
                  {documents.length === 0 ? (
                    <p className="text-muted text-center py-4">No documents uploaded</p>
                  ) : (
                    <Table hover responsive>
                      <thead>
                        <tr>
                          <th>Document</th>
                          <th>File</th>
                          <th>Uploaded</th>
                          <th>Verified</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((doc) => (
                          <tr key={doc.id}>
                            <td>{doc.requirement?.document_name || doc.file_name}</td>
                            <td>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                href={getDocumentUrl(doc.file_path)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <IconifyIcon icon="mingcute:download-2-line" className="me-1" />
                                {doc.file_name}
                              </Button>
                            </td>
                            <td>{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                            <td>
                              <Form.Check
                                type="switch"
                                id={`verify-${doc.id}`}
                                checked={doc.is_verified}
                                onChange={() => handleDocumentVerification(doc.id, doc.is_verified)}
                                disabled={verifyingDocId === doc.id}
                                label={doc.is_verified ? 'Verified' : 'Pending'}
                              />
                              {doc.verified_at && (
                                <small className="text-muted d-block">
                                  {new Date(doc.verified_at).toLocaleDateString()}
                                </small>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </CardBody>
              </Card>
            </Col>
            <Col lg={4}>
              <Card>
                <CardHeader>
                  <CardTitle as="h5">Required Documents</CardTitle>
                </CardHeader>
                <CardBody>
                  <ul className="list-unstyled mb-0">
                    {HOUSING_DOCUMENT_REQUIREMENTS.map((req) => {
                      const uploaded = documents.find(d => d.requirement?.document_code === req.document_code)
                      return (
                        <li key={req.document_code} className="d-flex align-items-center gap-2 mb-2">
                          <IconifyIcon
                            icon={uploaded ? 'mingcute:check-circle-fill' : 'mingcute:close-circle-line'}
                            className={uploaded ? 'text-success' : 'text-muted'}
                          />
                          <span className={req.is_mandatory ? 'fw-medium' : ''}>
                            {req.document_name}
                            {req.is_mandatory && <span className="text-danger"> *</span>}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* Allocation Tab */}
        <Tab eventKey="allocation" title="Allocation">
          <Card>
            <CardHeader>
              <CardTitle as="h5">Allocation</CardTitle>
            </CardHeader>
            <CardBody className="text-center py-5">
              <IconifyIcon icon="mingcute:time-line" className="fs-1 text-muted mb-3" />
              <p className="text-muted">Allocation functionality coming in Phase 4</p>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </>
  )
}

export default HousingRegistrationDetail

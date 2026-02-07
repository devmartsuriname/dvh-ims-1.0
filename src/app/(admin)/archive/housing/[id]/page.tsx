import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Button, Spinner, Badge, Tab, Tabs, Table } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { supabase } from '@/integrations/supabase/client'
import { useUserRole } from '@/hooks/useUserRole'
import { logAuditEvent } from '@/hooks/useAuditLog'
import type { AppRole } from '@/hooks/useUserRole'
import type { Json } from '@/integrations/supabase/types'

const ALLOWED_ROLES: AppRole[] = ['system_admin', 'minister', 'project_leader', 'director', 'ministerial_advisor', 'audit']

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
  created_at: string
  updated_at: string
  person?: { first_name: string; last_name: string; national_id: string }
  household?: { household_size: number; district_code: string }
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
  uploaded_at: string
  requirement: { document_name: string; document_code: string; is_mandatory: boolean }
}

interface AuditEvent {
  id: string
  action: string
  actor_role: string | null
  reason: string | null
  occurred_at: string
  metadata_json: Json | null
}

const ArchiveHousingDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { loading: roleLoading, hasAnyRole } = useUserRole()
  const auditLogged = useRef(false)

  const [registration, setRegistration] = useState<HousingRegistration | null>(null)
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([])
  const [urgencyAssessments, setUrgencyAssessments] = useState<UrgencyAssessment[]>([])
  const [documents, setDocuments] = useState<DocumentUpload[]>([])
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      setLoading(true)
      const [regRes, historyRes, urgencyRes, docsRes, auditRes] = await Promise.all([
        supabase
          .from('housing_registration')
          .select('*, person:applicant_person_id (first_name, last_name, national_id), household:household_id (household_size, district_code)')
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
          .select('id, file_path, file_name, is_verified, uploaded_at, requirement:requirement_id (document_name, document_code, is_mandatory)')
          .eq('registration_id', id)
          .order('uploaded_at', { ascending: false }),
        supabase
          .from('audit_event')
          .select('id, action, actor_role, reason, occurred_at, metadata_json')
          .eq('entity_type', 'housing_registration')
          .eq('entity_id', id)
          .order('occurred_at', { ascending: false }),
      ])

      if (regRes.error) {
        navigate('/archive')
        return
      }

      setRegistration(regRes.data)
      setStatusHistory(historyRes.data || [])
      setUrgencyAssessments(urgencyRes.data || [])
      setDocuments((docsRes.data as unknown as DocumentUpload[]) || [])
      setAuditEvents((auditRes.data as AuditEvent[]) || [])
      setLoading(false)
    }

    fetchData()
  }, [id])

  // Log ARCHIVE_VIEWED audit event once on mount
  useEffect(() => {
    if (!id || auditLogged.current) return
    auditLogged.current = true
    logAuditEvent({
      action: 'ARCHIVE_VIEWED',
      entity_type: 'housing_registration',
      entity_id: id,
      reason: 'Archive view accessed',
    })
  }, [id])

  if (roleLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>
      </div>
    )
  }

  if (!hasAnyRole(ALLOWED_ROLES)) {
    return <Navigate to="/dashboards" replace />
  }

  if (loading) {
    return (
      <>
        <PageTitle subName="Archive" title="Housing Registration" />
        <Card><CardBody className="text-center py-5"><Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner></CardBody></Card>
      </>
    )
  }

  if (!registration) {
    return (
      <>
        <PageTitle subName="Archive" title="Housing Registration" />
        <Card><CardBody className="text-center py-5">
          <p className="text-muted">Registration not found</p>
          <Button variant="primary" onClick={() => navigate('/archive')}>Back to Archive</Button>
        </CardBody></Card>
      </>
    )
  }

  const badge = STATUS_BADGES[registration.current_status] || { bg: 'secondary', label: registration.current_status }

  return (
    <>
      <PageTitle subName="Archive" title="Housing Registration" />

      <Card className="mb-3">
        <CardHeader className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <CardTitle as="h5" className="mb-0">{registration.reference_number}</CardTitle>
            <Badge bg={badge.bg}>{badge.label}</Badge>
            <Badge bg="dark">ARCHIVED</Badge>
          </div>
          <Button variant="outline-secondary" size="sm" onClick={() => navigate('/archive')}>
            <IconifyIcon icon="mingcute:arrow-left-line" className="me-1" />
            Back to Archive
          </Button>
        </CardHeader>
      </Card>

      <Tabs defaultActiveKey="overview" className="mb-3">
        {/* Overview Tab — READ-ONLY, no Change Status card */}
        <Tab eventKey="overview" title="Overview">
          <Card>
            <CardHeader><CardTitle as="h5">Registration Information</CardTitle></CardHeader>
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
                    <br /><small className="text-muted">{registration.person?.national_id}</small>
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
        </Tab>

        {/* Urgency Tab — READ-ONLY, no add form */}
        <Tab eventKey="urgency" title="Urgency">
          <Card>
            <CardHeader><CardTitle as="h5">Urgency Assessments</CardTitle></CardHeader>
            <CardBody>
              {urgencyAssessments.length === 0 ? (
                <p className="text-muted text-center py-4">No urgency assessments</p>
              ) : (
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Points</th>
                      <th>Justification</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {urgencyAssessments.map((u) => (
                      <tr key={u.id}>
                        <td>{u.urgency_category}</td>
                        <td><Badge bg="info">{u.urgency_points}</Badge></td>
                        <td>{u.justification || '-'}</td>
                        <td>{new Date(u.assessment_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Tab>

        {/* Documents Tab — READ-ONLY, no verify switches */}
        <Tab eventKey="documents" title={`Documents (${documents.length})`}>
          <Card>
            <CardHeader><CardTitle as="h5">Uploaded Documents</CardTitle></CardHeader>
            <CardBody>
              {documents.length === 0 ? (
                <p className="text-muted text-center py-4">No documents</p>
              ) : (
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Required</th>
                      <th>Verified</th>
                      <th>Uploaded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc.id}>
                        <td>
                          <span className="fw-medium">{doc.requirement?.document_name || doc.file_name}</span>
                          <br /><small className="text-muted">{doc.requirement?.document_code}</small>
                        </td>
                        <td>
                          <Badge bg={doc.requirement?.is_mandatory ? 'danger' : 'secondary'}>
                            {doc.requirement?.is_mandatory ? 'Required' : 'Optional'}
                          </Badge>
                        </td>
                        <td><Badge bg={doc.is_verified ? 'success' : 'warning'}>{doc.is_verified ? 'Verified' : 'Pending'}</Badge></td>
                        <td>{new Date(doc.uploaded_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Tab>

        {/* Status History Tab — READ-ONLY */}
        <Tab eventKey="history" title="Status History">
          <Card>
            <CardHeader><CardTitle as="h5">Status History</CardTitle></CardHeader>
            <CardBody>
              {statusHistory.length === 0 ? (
                <p className="text-muted text-center py-4">No history available</p>
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
                          ) : '-'}
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

        {/* Audit Trail Tab — READ-ONLY */}
        <Tab eventKey="audit-trail" title="Audit Trail">
          <Card>
            <CardHeader><CardTitle as="h5">Audit Events</CardTitle></CardHeader>
            <CardBody>
              {auditEvents.length === 0 ? (
                <p className="text-muted text-center py-4">No audit events</p>
              ) : (
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Role</th>
                      <th>Reason</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditEvents.map((evt) => (
                      <tr key={evt.id}>
                        <td><Badge bg="secondary">{evt.action}</Badge></td>
                        <td>{evt.actor_role || '-'}</td>
                        <td>{evt.reason || '-'}</td>
                        <td>{new Date(evt.occurred_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </>
  )
}

export default ArchiveHousingDetailPage

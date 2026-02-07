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
  in_social_review: { bg: 'info', label: 'In Social Review' },
  social_completed: { bg: 'primary', label: 'Social Completed' },
  returned_to_intake: { bg: 'warning', label: 'Returned to Intake' },
  in_technical_review: { bg: 'info', label: 'In Technical Review' },
  technical_approved: { bg: 'success', label: 'Technical Approved' },
  returned_to_social: { bg: 'warning', label: 'Returned to Social' },
  in_admin_review: { bg: 'info', label: 'In Admin Review' },
  admin_complete: { bg: 'success', label: 'Admin Complete' },
  returned_to_technical: { bg: 'warning', label: 'Returned to Technical' },
  screening: { bg: 'info', label: 'Screening' },
  needs_more_docs: { bg: 'warning', label: 'Needs More Docs' },
  fieldwork: { bg: 'primary', label: 'Fieldwork' },
  awaiting_director_approval: { bg: 'info', label: 'Awaiting Director Approval' },
  director_approved: { bg: 'success', label: 'Director Approved' },
  returned_to_screening: { bg: 'warning', label: 'Returned to Screening' },
  in_ministerial_advice: { bg: 'info', label: 'In Ministerial Advice' },
  ministerial_advice_complete: { bg: 'success', label: 'Advice Complete' },
  returned_to_director: { bg: 'warning', label: 'Returned to Director' },
  awaiting_minister_decision: { bg: 'info', label: 'Awaiting Minister Decision' },
  minister_approved: { bg: 'success', label: 'Minister Approved' },
  returned_to_advisor: { bg: 'warning', label: 'Returned to Advisor' },
  approved_for_council: { bg: 'success', label: 'Approved for Council' },
  council_doc_generated: { bg: 'dark', label: 'Council Doc Generated' },
  finalized: { bg: 'success', label: 'Finalized' },
  rejected: { bg: 'danger', label: 'Rejected' },
}

interface SubsidyCase {
  id: string
  case_number: string
  household_id: string
  applicant_person_id: string
  status: string
  district_code: string
  requested_amount: number | null
  approved_amount: number | null
  rejection_reason: string | null
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

interface DocumentUpload {
  id: string
  file_name: string
  file_path: string
  is_verified: boolean
  uploaded_at: string
  requirement?: { document_name: string; document_code: string }
}

interface Report {
  id: string
  report_json: Json
  is_finalized: boolean
  finalized_at: string | null
  updated_at: string
}

interface GeneratedDocument {
  id: string
  document_type: string
  file_name: string
  file_path: string
  generated_at: string
}

interface AuditEvent {
  id: string
  action: string
  actor_role: string | null
  reason: string | null
  occurred_at: string
  metadata_json: Json | null
}

const ArchiveSubsidyDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { loading: roleLoading, hasAnyRole } = useUserRole()
  const auditLogged = useRef(false)

  const [subsidyCase, setSubsidyCase] = useState<SubsidyCase | null>(null)
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([])
  const [documents, setDocuments] = useState<DocumentUpload[]>([])
  const [socialReport, setSocialReport] = useState<Report | null>(null)
  const [technicalReport, setTechnicalReport] = useState<Report | null>(null)
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>([])
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      setLoading(true)
      const [caseRes, historyRes, docsRes, socialRes, technicalRes, genDocsRes, auditRes] = await Promise.all([
        supabase
          .from('subsidy_case')
          .select('*, person:applicant_person_id (first_name, last_name, national_id), household:household_id (household_size, district_code)')
          .eq('id', id)
          .single(),
        supabase
          .from('subsidy_case_status_history')
          .select('*')
          .eq('case_id', id)
          .order('changed_at', { ascending: false }),
        supabase
          .from('subsidy_document_upload')
          .select('*, requirement:requirement_id (document_name, document_code)')
          .eq('case_id', id)
          .order('uploaded_at', { ascending: false }),
        supabase.from('social_report').select('*').eq('case_id', id).single(),
        supabase.from('technical_report').select('*').eq('case_id', id).single(),
        supabase.from('generated_document').select('*').eq('case_id', id).order('generated_at', { ascending: false }),
        supabase
          .from('audit_event')
          .select('id, action, actor_role, reason, occurred_at, metadata_json')
          .eq('entity_type', 'subsidy_case')
          .eq('entity_id', id)
          .order('occurred_at', { ascending: false }),
      ])

      if (caseRes.error) {
        navigate('/archive')
        return
      }

      setSubsidyCase(caseRes.data)
      setStatusHistory(historyRes.data || [])
      setDocuments(docsRes.data || [])
      setSocialReport(socialRes.data)
      setTechnicalReport(technicalRes.data)
      setGeneratedDocuments(genDocsRes.data || [])
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
      entity_type: 'subsidy_case',
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
        <PageTitle subName="Archive" title="Subsidy Case" />
        <Card><CardBody className="text-center py-5"><Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner></CardBody></Card>
      </>
    )
  }

  if (!subsidyCase) {
    return (
      <>
        <PageTitle subName="Archive" title="Subsidy Case" />
        <Card><CardBody className="text-center py-5">
          <p className="text-muted">Case not found</p>
          <Button variant="primary" onClick={() => navigate('/archive')}>Back to Archive</Button>
        </CardBody></Card>
      </>
    )
  }

  const badge = STATUS_BADGES[subsidyCase.status] || { bg: 'secondary', label: subsidyCase.status }

  const renderReportJson = (report: Report | null, label: string) => {
    if (!report) return <p className="text-muted text-center py-4">No {label} available</p>
    const data = typeof report.report_json === 'string' ? JSON.parse(report.report_json) : report.report_json
    return (
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <CardTitle as="h5">{label}</CardTitle>
          <Badge bg={report.is_finalized ? 'success' : 'warning'}>{report.is_finalized ? 'Finalized' : 'Draft'}</Badge>
        </CardHeader>
        <CardBody>
          {data && typeof data === 'object' ? (
            <Table bordered size="sm">
              <tbody>
                {Object.entries(data as Record<string, unknown>).map(([key, value]) => (
                  <tr key={key}>
                    <td className="fw-medium text-capitalize" style={{ width: '30%' }}>{key.replace(/_/g, ' ')}</td>
                    <td>{typeof value === 'object' ? JSON.stringify(value) : String(value ?? '-')}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted">No data</p>
          )}
          {report.finalized_at && (
            <small className="text-muted">Finalized: {new Date(report.finalized_at).toLocaleString()}</small>
          )}
        </CardBody>
      </Card>
    )
  }

  return (
    <>
      <PageTitle subName="Archive" title="Subsidy Case" />

      <Card className="mb-3">
        <CardHeader className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <CardTitle as="h5" className="mb-0">{subsidyCase.case_number}</CardTitle>
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
            <CardHeader><CardTitle as="h5">Case Information</CardTitle></CardHeader>
            <CardBody>
              <Row>
                <Col md={6} className="mb-3">
                  <label className="form-label text-muted small">Case Number</label>
                  <p className="mb-0 fw-medium">{subsidyCase.case_number}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <label className="form-label text-muted small">District</label>
                  <p className="mb-0 fw-medium">{subsidyCase.district_code}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <label className="form-label text-muted small">Applicant</label>
                  <p className="mb-0 fw-medium">
                    {subsidyCase.person?.first_name} {subsidyCase.person?.last_name}
                    <br /><small className="text-muted">{subsidyCase.person?.national_id}</small>
                  </p>
                </Col>
                <Col md={6} className="mb-3">
                  <label className="form-label text-muted small">Household Size</label>
                  <p className="mb-0 fw-medium">{subsidyCase.household?.household_size} member(s)</p>
                </Col>
                <Col md={6} className="mb-3">
                  <label className="form-label text-muted small">Requested Amount</label>
                  <p className="mb-0 fw-medium">{subsidyCase.requested_amount ? `SRD ${subsidyCase.requested_amount.toLocaleString()}` : '-'}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <label className="form-label text-muted small">Approved Amount</label>
                  <p className="mb-0 fw-medium">{subsidyCase.approved_amount ? `SRD ${subsidyCase.approved_amount.toLocaleString()}` : '-'}</p>
                </Col>
                {subsidyCase.rejection_reason && (
                  <Col md={12} className="mb-3">
                    <label className="form-label text-muted small">Rejection Reason</label>
                    <p className="mb-0 fw-medium">{subsidyCase.rejection_reason}</p>
                  </Col>
                )}
                <Col md={6} className="mb-3">
                  <label className="form-label text-muted small">Created</label>
                  <p className="mb-0 fw-medium">{new Date(subsidyCase.created_at).toLocaleString()}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <label className="form-label text-muted small">Last Updated</label>
                  <p className="mb-0 fw-medium">{new Date(subsidyCase.updated_at).toLocaleString()}</p>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Tab>

        {/* Documents Tab — READ-ONLY, no verify buttons */}
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
                      <th>File</th>
                      <th>Uploaded</th>
                      <th>Verified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc.id}>
                        <td>{doc.requirement?.document_name || '-'}</td>
                        <td>{doc.file_name}</td>
                        <td>{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                        <td><Badge bg={doc.is_verified ? 'success' : 'warning'}>{doc.is_verified ? 'Verified' : 'Pending'}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Tab>

        {/* Social Report Tab — READ-ONLY */}
        <Tab eventKey="social-report" title="Social Report">
          {renderReportJson(socialReport, 'Social Report')}
        </Tab>

        {/* Technical Report Tab — READ-ONLY */}
        <Tab eventKey="technical-report" title="Technical Report">
          {renderReportJson(technicalReport, 'Technical Report')}
        </Tab>

        {/* Generated Documents Tab — READ-ONLY */}
        {generatedDocuments.length > 0 && (
          <Tab eventKey="generated-docs" title="Generated Documents">
            <Card>
              <CardHeader><CardTitle as="h5">Generated Documents</CardTitle></CardHeader>
              <CardBody>
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Type</th>
                      <th>Generated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedDocuments.map((doc) => (
                      <tr key={doc.id}>
                        <td>{doc.file_name}</td>
                        <td>{doc.document_type}</td>
                        <td>{new Date(doc.generated_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Tab>
        )}

        {/* Status History Tab — READ-ONLY */}
        <Tab eventKey="history" title="Status History">
          <Card>
            <CardHeader><CardTitle as="h5">Status History</CardTitle></CardHeader>
            <CardBody>
              {statusHistory.length === 0 ? (
                <p className="text-muted text-center py-4">No history available</p>
              ) : (
                <div className="timeline">
                  {statusHistory.map((entry) => (
                    <div key={entry.id} className="d-flex gap-3 mb-3 pb-3 border-bottom">
                      <div className="flex-shrink-0">
                        <IconifyIcon icon="mingcute:time-line" className="text-muted fs-4" />
                      </div>
                      <div>
                        <p className="mb-1">
                          <Badge bg={STATUS_BADGES[entry.to_status]?.bg || 'secondary'}>
                            {STATUS_BADGES[entry.to_status]?.label || entry.to_status}
                          </Badge>
                          {entry.from_status && (
                            <span className="text-muted ms-2">
                              from {STATUS_BADGES[entry.from_status]?.label || entry.from_status}
                            </span>
                          )}
                        </p>
                        {entry.reason && <p className="mb-1 text-muted small">{entry.reason}</p>}
                        <small className="text-muted">{new Date(entry.changed_at).toLocaleString()}</small>
                      </div>
                    </div>
                  ))}
                </div>
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

export default ArchiveSubsidyDetailPage

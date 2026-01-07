import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Button, Spinner, Badge, Tab, Tabs, Form, Table } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'react-toastify'
import { useAuditLog } from '@/hooks/useAuditLog'

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

interface DocumentUpload {
  id: string
  file_name: string
  file_path: string
  is_verified: boolean
  uploaded_at: string
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

interface Report {
  id: string
  report_json: any
  is_finalized: boolean
  finalized_at: string | null
  updated_at: string
}

const STATUS_BADGES: Record<string, { bg: string; label: string }> = {
  received: { bg: 'secondary', label: 'Received' },
  screening: { bg: 'info', label: 'Screening' },
  needs_more_docs: { bg: 'warning', label: 'Needs More Docs' },
  fieldwork: { bg: 'primary', label: 'Fieldwork' },
  approved_for_council: { bg: 'success', label: 'Approved for Council' },
  council_doc_generated: { bg: 'dark', label: 'Council Doc Generated' },
  finalized: { bg: 'success', label: 'Finalized' },
  rejected: { bg: 'danger', label: 'Rejected' },
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
  received: ['screening', 'rejected'],
  screening: ['needs_more_docs', 'fieldwork', 'rejected'],
  needs_more_docs: ['screening', 'rejected'],
  fieldwork: ['approved_for_council', 'rejected'],
  approved_for_council: ['council_doc_generated', 'rejected'],
  council_doc_generated: ['finalized', 'rejected'],
}

const SubsidyCaseDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [subsidyCase, setSubsidyCase] = useState<SubsidyCase | null>(null)
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([])
  const [documents, setDocuments] = useState<DocumentUpload[]>([])
  const [requirements, setRequirements] = useState<DocumentRequirement[]>([])
  const [socialReport, setSocialReport] = useState<Report | null>(null)
  const [technicalReport, setTechnicalReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusReason, setStatusReason] = useState('')
  const { logEvent } = useAuditLog()

  const fetchCase = async () => {
    if (!id) return

    setLoading(true)
    
    const [caseRes, historyRes, docsRes, reqsRes, socialRes, technicalRes] = await Promise.all([
      supabase
        .from('subsidy_case')
        .select(`
          *,
          person:applicant_person_id (first_name, last_name, national_id),
          household:household_id (household_size, district_code)
        `)
        .eq('id', id)
        .single(),
      supabase
        .from('subsidy_case_status_history')
        .select('*')
        .eq('case_id', id)
        .order('changed_at', { ascending: false }),
      supabase
        .from('subsidy_document_upload')
        .select(`
          *,
          requirement:requirement_id (document_name, document_code)
        `)
        .eq('case_id', id)
        .order('uploaded_at', { ascending: false }),
      supabase
        .from('subsidy_document_requirement')
        .select('*')
        .order('document_name'),
      supabase
        .from('social_report')
        .select('*')
        .eq('case_id', id)
        .single(),
      supabase
        .from('technical_report')
        .select('*')
        .eq('case_id', id)
        .single()
    ])

    if (caseRes.error) {
      toast.error('Case not found')
      navigate('/subsidy-cases')
      return
    }

    setSubsidyCase(caseRes.data)
    setStatusHistory(historyRes.data || [])
    setDocuments(docsRes.data || [])
    setRequirements(reqsRes.data || [])
    setSocialReport(socialRes.data)
    setTechnicalReport(technicalRes.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchCase()
  }, [id])

  const handleStatusChange = async (newStatus: string) => {
    if (!subsidyCase || !statusReason.trim()) {
      toast.error('Please provide a reason for the status change')
      return
    }

    setStatusLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Update case status
      const { error: updateError } = await supabase
        .from('subsidy_case')
        .update({ status: newStatus })
        .eq('id', subsidyCase.id)

      if (updateError) throw updateError

      // Add status history entry
      const { error: historyError } = await supabase
        .from('subsidy_case_status_history')
        .insert({
          case_id: subsidyCase.id,
          from_status: subsidyCase.status,
          to_status: newStatus,
          changed_by: user?.id,
          reason: statusReason,
        })

      if (historyError) throw historyError

      await logEvent({
        action: 'STATUS_CHANGE',
        entity_type: 'subsidy_case',
        entity_id: subsidyCase.id,
        reason: `Status changed from ${subsidyCase.status} to ${newStatus}: ${statusReason}`,
      })

      toast.success(`Status changed to ${STATUS_BADGES[newStatus]?.label || newStatus}`)
      setStatusReason('')
      fetchCase()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status')
    } finally {
      setStatusLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <PageTitle subName="Bouwsubsidie" title="Case Detail" />
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

  if (!subsidyCase) {
    return (
      <>
        <PageTitle subName="Bouwsubsidie" title="Case Detail" />
        <Card>
          <CardBody className="text-center py-5">
            <p className="text-muted">Case not found</p>
            <Button variant="primary" onClick={() => navigate('/subsidy-cases')}>
              Back to Cases
            </Button>
          </CardBody>
        </Card>
      </>
    )
  }

  const allowedTransitions = STATUS_TRANSITIONS[subsidyCase.status] || []
  const badge = STATUS_BADGES[subsidyCase.status] || { bg: 'secondary', label: subsidyCase.status }

  return (
    <>
      <PageTitle subName="Bouwsubsidie" title="Case Detail" />

      <Card className="mb-3">
        <CardHeader className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <CardTitle as="h5" className="mb-0">{subsidyCase.case_number}</CardTitle>
            <Badge bg={badge.bg}>{badge.label}</Badge>
          </div>
          <Button variant="outline-secondary" size="sm" onClick={() => navigate('/subsidy-cases')}>
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
                  <CardTitle as="h5">Case Information</CardTitle>
                </CardHeader>
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
                        <br />
                        <small className="text-muted">{subsidyCase.person?.national_id}</small>
                      </p>
                    </Col>
                    <Col md={6} className="mb-3">
                      <label className="form-label text-muted small">Household Size</label>
                      <p className="mb-0 fw-medium">{subsidyCase.household?.household_size} member(s)</p>
                    </Col>
                    <Col md={6} className="mb-3">
                      <label className="form-label text-muted small">Requested Amount</label>
                      <p className="mb-0 fw-medium">
                        {subsidyCase.requested_amount ? `SRD ${subsidyCase.requested_amount.toLocaleString()}` : '-'}
                      </p>
                    </Col>
                    <Col md={6} className="mb-3">
                      <label className="form-label text-muted small">Approved Amount</label>
                      <p className="mb-0 fw-medium">
                        {subsidyCase.approved_amount ? `SRD ${subsidyCase.approved_amount.toLocaleString()}` : '-'}
                      </p>
                    </Col>
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

        {/* Documents Tab */}
        <Tab eventKey="documents" title="Documents">
          <Row>
            <Col lg={8}>
              <Card>
                <CardHeader>
                  <CardTitle as="h5">Uploaded Documents</CardTitle>
                </CardHeader>
                <CardBody>
                  {documents.length === 0 ? (
                    <p className="text-muted text-center py-4">No documents uploaded yet</p>
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
                            <td>
                              {doc.is_verified ? (
                                <Badge bg="success">Verified</Badge>
                              ) : (
                                <Badge bg="warning">Pending</Badge>
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
                    {requirements.map((req) => {
                      const uploaded = documents.find(d => d.requirement?.document_code === req.document_code)
                      return (
                        <li key={req.id} className="d-flex align-items-center gap-2 mb-2">
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

        {/* Social Report Tab */}
        <Tab eventKey="social-report" title="Social Report">
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle as="h5">Social Report</CardTitle>
              {socialReport?.is_finalized && (
                <Badge bg="success">Finalized</Badge>
              )}
            </CardHeader>
            <CardBody>
              {socialReport ? (
                <div>
                  <p className="text-muted">
                    Last updated: {new Date(socialReport.updated_at).toLocaleString()}
                  </p>
                  <pre className="bg-light p-3 rounded">
                    {JSON.stringify(socialReport.report_json, null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-muted text-center py-4">No social report found</p>
              )}
            </CardBody>
          </Card>
        </Tab>

        {/* Technical Report Tab */}
        <Tab eventKey="technical-report" title="Technical Report">
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle as="h5">Technical Report</CardTitle>
              {technicalReport?.is_finalized && (
                <Badge bg="success">Finalized</Badge>
              )}
            </CardHeader>
            <CardBody>
              {technicalReport ? (
                <div>
                  <p className="text-muted">
                    Last updated: {new Date(technicalReport.updated_at).toLocaleString()}
                  </p>
                  <pre className="bg-light p-3 rounded">
                    {JSON.stringify(technicalReport.report_json, null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-muted text-center py-4">No technical report found</p>
              )}
            </CardBody>
          </Card>
        </Tab>

        {/* History Tab */}
        <Tab eventKey="history" title="History">
          <Card>
            <CardHeader>
              <CardTitle as="h5">Status History</CardTitle>
            </CardHeader>
            <CardBody>
              {statusHistory.length === 0 ? (
                <p className="text-muted text-center py-4">No history available</p>
              ) : (
                <div className="timeline">
                  {statusHistory.map((entry, index) => (
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
                        <small className="text-muted">
                          {new Date(entry.changed_at).toLocaleString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </Tab>

        {/* Raadvoorstel Tab */}
        <Tab eventKey="raadvoorstel" title="Raadvoorstel">
          <Card>
            <CardHeader>
              <CardTitle as="h5">Raadvoorstel Generation</CardTitle>
            </CardHeader>
            <CardBody>
              <p className="text-muted text-center py-4">
                Raadvoorstel document generation will be available when the case status is "Approved for Council".
              </p>
              {subsidyCase.status === 'approved_for_council' && (
                <div className="text-center">
                  <Button variant="primary" disabled>
                    <IconifyIcon icon="mingcute:file-line" className="me-1" />
                    Generate Raadvoorstel (Coming Soon)
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </>
  )
}

export default SubsidyCaseDetail

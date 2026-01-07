import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardBody, Row, Col, Badge, Spinner, Tab, Tabs, Table, Button } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'react-toastify'

interface AllocationRun {
  id: string
  district_code: string
  run_date: string
  run_status: string
  candidates_count: number | null
  allocations_count: number | null
  executed_by: string
  completed_at: string | null
  error_message: string | null
}

// View-model for rendering candidates (avoids mutating Supabase response)
interface CandidateViewModel {
  id: string
  registration_id: string
  urgency_score: number
  waiting_list_position: number
  composite_rank: number
  is_selected: boolean
  reference_number: string
  applicant_name: string
}

interface AllocationDecision {
  id: string
  run_id: string
  candidate_id: string
  registration_id: string
  decision: string
  decision_reason: string | null
  decided_by: string
  decided_at: string
}

const STATUS_BADGES: Record<string, string> = {
  pending: 'warning',
  running: 'info',
  completed: 'success',
  failed: 'danger'
}

const DECISION_BADGES: Record<string, string> = {
  approved: 'success',
  rejected: 'danger',
  deferred: 'warning'
}

const AllocationRunDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [run, setRun] = useState<AllocationRun | null>(null)
  const [candidates, setCandidates] = useState<CandidateViewModel[]>([])
  const [decisions, setDecisions] = useState<AllocationDecision[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchRunDetails()
    }
  }, [id])

  const fetchRunDetails = async () => {
    setLoading(true)

    // Fetch run
    const { data: runData, error: runError } = await supabase
      .from('allocation_run')
      .select('*')
      .eq('id', id)
      .single()

    if (runError) {
      toast.error('Failed to load run details')
      console.error(runError)
      setLoading(false)
      return
    }

    setRun(runData)

    // Fetch candidates with registration info
    const { data: candidatesData, error: candidatesError } = await supabase
      .from('allocation_candidate')
      .select(`
        *,
        registration:housing_registration (
          reference_number,
          applicant_person_id
        )
      `)
      .eq('run_id', id)
      .order('composite_rank', { ascending: true })

    if (!candidatesError && candidatesData) {
      // Fetch person names for each candidate
      const personIds = candidatesData
        .map(c => c.registration?.applicant_person_id)
        .filter(Boolean) as string[]

      let personMap = new Map<string, { first_name: string; last_name: string }>()
      
      if (personIds.length > 0) {
        const { data: persons } = await supabase
          .from('person')
          .select('id, first_name, last_name')
          .in('id', personIds)

        personMap = new Map(persons?.map(p => [p.id, p]) || [])
      }

      // Map to view-model (no mutation of Supabase response)
      const viewModels: CandidateViewModel[] = candidatesData.map(c => {
        const person = c.registration?.applicant_person_id 
          ? personMap.get(c.registration.applicant_person_id) 
          : undefined
        return {
          id: c.id,
          registration_id: c.registration_id,
          urgency_score: c.urgency_score,
          waiting_list_position: c.waiting_list_position,
          composite_rank: c.composite_rank,
          is_selected: c.is_selected,
          reference_number: c.registration?.reference_number || '-',
          applicant_name: person ? `${person.first_name} ${person.last_name}` : '-'
        }
      })

      setCandidates(viewModels)
    }

    // Fetch decisions
    const { data: decisionsData, error: decisionsError } = await supabase
      .from('allocation_decision')
      .select('*')
      .eq('run_id', id)
      .order('decided_at', { ascending: false })

    if (!decisionsError && decisionsData) {
      setDecisions(decisionsData)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <>
        <PageTitle subName="Allocation Engine" title="Run Detail" />
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      </>
    )
  }

  if (!run) {
    return (
      <>
        <PageTitle subName="Allocation Engine" title="Run Detail" />
        <Card>
          <CardBody className="text-center py-5">
            <h5>Run not found</h5>
            <Button variant="primary" onClick={() => navigate('/allocation-runs')}>
              Back to Runs
            </Button>
          </CardBody>
        </Card>
      </>
    )
  }

  return (
    <>
      <PageTitle subName="Allocation Engine" title="Run Detail" />

      <Card className="mb-4">
        <CardBody>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h5 className="mb-1">Run: {run.id.substring(0, 8)}...</h5>
              <Badge bg={STATUS_BADGES[run.run_status]}>{run.run_status}</Badge>
            </div>
            <Button variant="secondary" size="sm" onClick={() => navigate('/allocation-runs')}>
              <IconifyIcon icon="mingcute:arrow-left-line" className="me-1" />
              Back
            </Button>
          </div>

          <Row>
            <Col md={3}>
              <p className="mb-1 text-muted">District</p>
              <p className="fw-medium">{run.district_code}</p>
            </Col>
            <Col md={3}>
              <p className="mb-1 text-muted">Run Date</p>
              <p className="fw-medium">{new Date(run.run_date).toLocaleString()}</p>
            </Col>
            <Col md={3}>
              <p className="mb-1 text-muted">Candidates</p>
              <p className="fw-medium">{run.candidates_count ?? '-'}</p>
            </Col>
            <Col md={3}>
              <p className="mb-1 text-muted">Selected</p>
              <p className="fw-medium">{run.allocations_count ?? '-'}</p>
            </Col>
          </Row>

          {run.error_message && (
            <div className="alert alert-danger mt-3 mb-0">
              <strong>Error:</strong> {run.error_message}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <Tabs defaultActiveKey="candidates" className="mb-3">
            <Tab eventKey="candidates" title="Candidates">
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Reference</th>
                    <th>Applicant</th>
                    <th>Urgency Score</th>
                    <th>Wait Position</th>
                    <th>Selected</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-4">
                        No candidates for this run
                      </td>
                    </tr>
                  ) : (
                    candidates.map(c => (
                      <tr key={c.id}>
                        <td>{c.composite_rank}</td>
                        <td>{c.reference_number}</td>
                        <td>{c.applicant_name}</td>
                        <td>{c.urgency_score}</td>
                        <td>{c.waiting_list_position}</td>
                        <td>
                          <Badge bg={c.is_selected ? 'success' : 'secondary'}>
                            {c.is_selected ? 'Yes' : 'No'}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Tab>

            <Tab eventKey="decisions" title="Decisions">
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Registration</th>
                    <th>Decision</th>
                    <th>Reason</th>
                    <th>Decided At</th>
                  </tr>
                </thead>
                <tbody>
                  {decisions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-4">
                        No decisions made yet. Make decisions from the Decisions page.
                      </td>
                    </tr>
                  ) : (
                    decisions.map(d => (
                      <tr key={d.id}>
                        <td>{d.registration_id.substring(0, 8)}...</td>
                        <td>
                          <Badge bg={DECISION_BADGES[d.decision]}>{d.decision}</Badge>
                        </td>
                        <td>{d.decision_reason || '-'}</td>
                        <td>{new Date(d.decided_at).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </>
  )
}

export default AllocationRunDetail

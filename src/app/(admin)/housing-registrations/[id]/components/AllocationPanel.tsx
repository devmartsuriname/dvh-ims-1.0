import { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Table, Badge, Spinner } from 'react-bootstrap'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { supabase } from '@/integrations/supabase/client'
import { format } from 'date-fns'

interface AllocationCandidate {
  id: string
  run_id: string
  urgency_score: number
  waiting_list_position: number
  composite_rank: number
  is_selected: boolean
  allocation_run?: {
    district_code: string
    run_date: string
    run_status: string
  }
}

interface AllocationDecision {
  id: string
  decision: string
  decision_reason: string | null
  decided_at: string
  candidate_id: string
}

interface AssignmentRecord {
  id: string
  assignment_type: string
  housing_reference: string | null
  assignment_date: string
  notes: string | null
  recorded_at: string
}

interface AllocationPanelProps {
  registrationId: string
  currentStatus: string
  districtCode: string
}

const PRE_ALLOCATION_STATUSES = ['received', 'under_review', 'urgency_assessed']

const AllocationPanel = ({ registrationId, currentStatus, districtCode }: AllocationPanelProps) => {
  const [candidates, setCandidates] = useState<AllocationCandidate[]>([])
  const [decisions, setDecisions] = useState<AllocationDecision[]>([])
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAllocationData = async () => {
      setLoading(true)
      try {
        const [candidateRes, decisionRes, assignmentRes] = await Promise.all([
          supabase
            .from('allocation_candidate')
            .select('id, run_id, urgency_score, waiting_list_position, composite_rank, is_selected, allocation_run:run_id(district_code, run_date, run_status)')
            .eq('registration_id', registrationId)
            .order('composite_rank', { ascending: true }),
          supabase
            .from('allocation_decision')
            .select('id, decision, decision_reason, decided_at, candidate_id')
            .eq('registration_id', registrationId)
            .order('decided_at', { ascending: false }),
          supabase
            .from('assignment_record')
            .select('id, assignment_type, housing_reference, assignment_date, notes, recorded_at')
            .eq('registration_id', registrationId)
            .order('recorded_at', { ascending: false }),
        ])

        if (candidateRes.data) setCandidates(candidateRes.data as unknown as AllocationCandidate[])
        if (decisionRes.data) setDecisions(decisionRes.data as unknown as AllocationDecision[])
        if (assignmentRes.data) setAssignments(assignmentRes.data as unknown as AssignmentRecord[])
      } catch (err) {
        console.error('Error fetching allocation data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAllocationData()
  }, [registrationId])

  if (loading) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <Spinner animation="border" size="sm" className="me-2" />
          Loading allocation data...
        </CardBody>
      </Card>
    )
  }

  const hasData = candidates.length > 0 || decisions.length > 0 || assignments.length > 0
  const isPreAllocation = PRE_ALLOCATION_STATUSES.includes(currentStatus)

  if (!hasData && isPreAllocation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle as="h5">Allocation</CardTitle>
        </CardHeader>
        <CardBody className="text-center py-5">
          <IconifyIcon icon="mingcute:time-line" className="fs-1 text-muted mb-3" />
          <p className="text-muted mb-1">This registration has not yet reached the allocation stage.</p>
          <p className="text-muted small">
            Current status: <Badge bg="secondary">{currentStatus.replace(/_/g, ' ')}</Badge>
            {' '}— allocation begins after the waiting list stage.
          </p>
        </CardBody>
      </Card>
    )
  }

  if (!hasData && currentStatus === 'waiting_list') {
    return (
      <Card>
        <CardHeader>
          <CardTitle as="h5">Allocation</CardTitle>
        </CardHeader>
        <CardBody className="text-center py-5">
          <IconifyIcon icon="mingcute:time-line" className="fs-1 text-warning mb-3" />
          <p className="text-muted mb-1">Awaiting allocation run for district <strong>{districtCode}</strong>.</p>
          <p className="text-muted small">
            This registration is on the waiting list and will be considered in the next allocation run.
          </p>
        </CardBody>
      </Card>
    )
  }

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle as="h5">Allocation</CardTitle>
        </CardHeader>
        <CardBody className="text-center py-5">
          <IconifyIcon icon="mingcute:information-line" className="fs-1 text-muted mb-3" />
          <p className="text-muted">No allocation records found for this registration.</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <>
      {/* Candidate History */}
      {candidates.length > 0 && (
        <Card className="mb-3">
          <CardHeader>
            <CardTitle as="h5">Allocation Candidates</CardTitle>
          </CardHeader>
          <CardBody>
            <Table responsive hover size="sm">
              <thead>
                <tr>
                  <th>Run Date</th>
                  <th>District</th>
                  <th>Urgency Score</th>
                  <th>Waiting Position</th>
                  <th>Composite Rank</th>
                  <th>Selected</th>
                  <th>Run Status</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.id}>
                    <td>{c.allocation_run ? format(new Date(c.allocation_run.run_date), 'dd-MM-yyyy HH:mm') : '—'}</td>
                    <td>{c.allocation_run?.district_code ?? '—'}</td>
                    <td>{c.urgency_score}</td>
                    <td>{c.waiting_list_position}</td>
                    <td><strong>{c.composite_rank}</strong></td>
                    <td>
                      <Badge bg={c.is_selected ? 'success' : 'secondary'}>
                        {c.is_selected ? 'Yes' : 'No'}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={c.allocation_run?.run_status === 'completed' ? 'success' : 'warning'}>
                        {c.allocation_run?.run_status ?? '—'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Decisions */}
      {decisions.length > 0 && (
        <Card className="mb-3">
          <CardHeader>
            <CardTitle as="h5">Allocation Decisions</CardTitle>
          </CardHeader>
          <CardBody>
            <Table responsive hover size="sm">
              <thead>
                <tr>
                  <th>Decision</th>
                  <th>Reason</th>
                  <th>Decided At</th>
                </tr>
              </thead>
              <tbody>
                {decisions.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <Badge bg={d.decision === 'Accepted' ? 'success' : 'danger'}>
                        {d.decision}
                      </Badge>
                    </td>
                    <td>{d.decision_reason ?? '—'}</td>
                    <td>{format(new Date(d.decided_at), 'dd-MM-yyyy HH:mm')}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Assignments */}
      {assignments.length > 0 && (
        <Card className="mb-3">
          <CardHeader>
            <CardTitle as="h5">Housing Assignments</CardTitle>
          </CardHeader>
          <CardBody>
            <Table responsive hover size="sm">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Housing Reference</th>
                  <th>Assignment Date</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id}>
                    <td>{a.assignment_type}</td>
                    <td>{a.housing_reference ?? '—'}</td>
                    <td>{format(new Date(a.assignment_date), 'dd-MM-yyyy')}</td>
                    <td>{a.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      )}
    </>
  )
}

export default AllocationPanel

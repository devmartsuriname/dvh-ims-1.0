import { useEffect, useState } from 'react'
import { Card, CardBody, Button, Badge, Spinner, Tab, Tabs } from 'react-bootstrap'
import { Grid, html } from 'gridjs'
import 'gridjs/dist/theme/mermaid.css'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'react-toastify'
import DecisionFormModal from './DecisionFormModal'

interface AllocationCandidate {
  id: string
  run_id: string
  registration_id: string
  urgency_score: number
  waiting_list_position: number
  composite_rank: number
  is_selected: boolean
  registration?: {
    reference_number: string
    applicant_person_id: string
    district_code: string
  }
  run?: {
    district_code: string
    run_date: string
  }
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

const DECISION_BADGES: Record<string, string> = {
  approved: 'success',
  rejected: 'danger',
  deferred: 'warning'
}

const DecisionTable = () => {
  const [pendingCandidates, setPendingCandidates] = useState<AllocationCandidate[]>([])
  const [decisions, setDecisions] = useState<AllocationDecision[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<AllocationCandidate | null>(null)

  const fetchData = async () => {
    setLoading(true)

    // Fetch all decisions
    const { data: decisionsData } = await supabase
      .from('allocation_decision')
      .select('*')
      .order('decided_at', { ascending: false })

    if (decisionsData) {
      setDecisions(decisionsData)
    }

    // Fetch selected candidates without decisions
    const decidedCandidateIds = decisionsData?.map(d => d.candidate_id) || []

    const { data: candidatesData, error } = await supabase
      .from('allocation_candidate')
      .select(`
        *,
        registration:housing_registration (
          reference_number,
          applicant_person_id,
          district_code
        ),
        run:allocation_run (
          district_code,
          run_date
        )
      `)
      .eq('is_selected', true)
      .order('composite_rank', { ascending: true })

    if (error) {
      toast.error('Failed to load candidates')
      console.error(error)
    } else {
      // Filter out already decided candidates
      const pending = (candidatesData || []).filter(
        c => !decidedCandidateIds.includes(c.id)
      )
      setPendingCandidates(pending)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!loading) {
      // Render pending candidates grid
      const pendingContainer = document.getElementById('pending-grid')
      if (pendingContainer && pendingCandidates.length > 0) {
        pendingContainer.innerHTML = ''
        
        new Grid({
          columns: [
            { name: 'Rank', width: '60px' },
            { name: 'Reference', width: '120px' },
            { name: 'District', width: '100px' },
            { name: 'Urgency', width: '80px' },
            { name: 'Run Date', width: '120px' },
            {
              name: 'Action',
              width: '120px',
              formatter: (_, row) => html(`
                <button class="btn btn-sm btn-primary make-decision" data-id="${row.cells[5].data}">
                  Make Decision
                </button>
              `)
            }
          ],
          data: pendingCandidates.map(c => [
            c.composite_rank,
            c.registration?.reference_number || '-',
            c.registration?.district_code || '-',
            c.urgency_score,
            c.run ? new Date(c.run.run_date).toLocaleDateString() : '-',
            c.id
          ]),
          pagination: { limit: 10 },
          className: {
            table: 'table table-hover mb-0'
          }
        }).render(pendingContainer)

        pendingContainer.addEventListener('click', (e) => {
          const target = e.target as HTMLElement
          const btn = target.closest('.make-decision')
          if (btn) {
            const id = btn.getAttribute('data-id')
            const candidate = pendingCandidates.find(c => c.id === id)
            if (candidate) {
              setSelectedCandidate(candidate)
              setShowModal(true)
            }
          }
        })
      }

      // Render decisions grid
      const decisionsContainer = document.getElementById('decisions-grid')
      if (decisionsContainer && decisions.length > 0) {
        decisionsContainer.innerHTML = ''
        
        new Grid({
          columns: [
            { name: 'Registration', width: '150px' },
            { 
              name: 'Decision', 
              width: '100px',
              formatter: (cell) => {
                const decision = String(cell)
                return html(`<span class="badge bg-${DECISION_BADGES[decision] || 'secondary'}">${decision}</span>`)
              }
            },
            { name: 'Reason', width: '200px' },
            { name: 'Decided At', width: '150px' }
          ],
          data: decisions.map(d => [
            d.registration_id.substring(0, 12) + '...',
            d.decision,
            d.decision_reason || '-',
            new Date(d.decided_at).toLocaleString()
          ]),
          search: true,
          pagination: { limit: 10 },
          className: {
            table: 'table table-hover mb-0'
          }
        }).render(decisionsContainer)
      }
    }
  }, [loading, pendingCandidates, decisions])

  const handleDecisionMade = () => {
    setShowModal(false)
    setSelectedCandidate(null)
    fetchData()
  }

  return (
    <>
      <Card>
        <CardBody>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Tabs defaultActiveKey="pending" className="mb-3">
              <Tab eventKey="pending" title={`Pending (${pendingCandidates.length})`}>
                {pendingCandidates.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    No pending decisions. All selected candidates have been processed.
                  </div>
                ) : (
                  <div id="pending-grid"></div>
                )}
              </Tab>
              <Tab eventKey="history" title={`History (${decisions.length})`}>
                {decisions.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    No decisions made yet.
                  </div>
                ) : (
                  <div id="decisions-grid"></div>
                )}
              </Tab>
            </Tabs>
          )}
        </CardBody>
      </Card>

      <DecisionFormModal
        show={showModal}
        onHide={() => {
          setShowModal(false)
          setSelectedCandidate(null)
        }}
        candidate={selectedCandidate}
        onSuccess={handleDecisionMade}
      />
    </>
  )
}

export default DecisionTable

import { useState, useEffect } from 'react'
import { Card, CardBody, Button, Spinner } from 'react-bootstrap'
import { Grid } from 'gridjs-react'
import { html } from 'gridjs'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import RunExecutorModal from './RunExecutorModal'

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

const STATUS_BADGES: Record<string, string> = {
  pending: 'warning',
  running: 'info',
  completed: 'success',
  failed: 'danger'
}

const RunTable = () => {
  const [runs, setRuns] = useState<AllocationRun[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  const fetchRuns = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('allocation_run')
      .select('*')
      .order('run_date', { ascending: false })

    if (error) {
      toast.error('Failed to load allocation runs')
      console.error(error)
    } else {
      setRuns(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRuns()
  }, [])

  // Event delegation for View button clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const btn = target.closest('[data-run-view]') as HTMLElement | null
      if (btn) {
        const runId = btn.getAttribute('data-run-view')
        if (runId) navigate(`/allocation-runs/${runId}`)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [navigate])

  const handleRunExecuted = () => {
    setShowModal(false)
    fetchRuns()
  }

  // Prepare grid data
  const gridData = runs.map(r => [
    r.id.substring(0, 8) + '...',
    r.district_code,
    new Date(r.run_date).toLocaleString(),
    r.run_status,
    r.candidates_count ?? '-',
    r.allocations_count ?? '-',
    r.id
  ])

  return (
    <>
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">Allocation Runs</h5>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => setShowModal(true)}
            >
              <IconifyIcon icon="mingcute:play-circle-line" className="me-1" />
              Execute Run
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Grid
              data={gridData}
              columns={[
                { name: 'Run ID', width: '150px' },
                { name: 'District', width: '100px' },
                { name: 'Run Date', width: '150px' },
                { 
                  name: 'Status', 
                  width: '100px',
                  formatter: (cell) => {
                    const status = String(cell)
                    return html(`<span class="badge bg-${STATUS_BADGES[status] || 'secondary'}">${status}</span>`)
                  }
                },
                { name: 'Candidates', width: '100px' },
                { name: 'Allocated', width: '100px' },
                {
                  name: 'Actions',
                  width: '100px',
                  formatter: (cell) => html(`
                    <button class="btn btn-sm btn-soft-info" data-run-view="${cell}">
                      View
                    </button>
                  `)
                }
              ]}
              search={true}
              pagination={{ limit: 10 }}
              className={{
                table: 'table table-hover mb-0'
              }}
            />
          )}
        </CardBody>
      </Card>

      <RunExecutorModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSuccess={handleRunExecuted}
      />
    </>
  )
}

export default RunTable
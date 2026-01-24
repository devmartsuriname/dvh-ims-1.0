import { useEffect, useState } from 'react'
import { Card, CardBody, Button, Spinner } from 'react-bootstrap'
import { Grid } from 'gridjs-react'
import { html } from 'gridjs'
import { supabase } from '@/integrations/supabase/client'
import { notify } from '@/utils/notify'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import AssignmentFormModal from './AssignmentFormModal'

interface AssignmentRecord {
  id: string
  registration_id: string
  decision_id: string | null
  assignment_type: string
  assignment_date: string
  housing_reference: string | null
  notes: string | null
  recorded_by: string
  recorded_at: string
  registration?: {
    reference_number: string
  }
}

const TYPE_BADGES: Record<string, string> = {
  internal: 'primary',
  external: 'info'
}

const AssignmentTable = () => {
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchAssignments = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('assignment_record')
      .select(`
        *,
        registration:housing_registration (
          reference_number
        )
      `)
      .order('recorded_at', { ascending: false })

    if (error) {
      notify.error('Failed to load assignments')
      console.error(error)
    } else {
      setAssignments(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAssignments()
  }, [])

  const handleAssignmentCreated = () => {
    setShowModal(false)
    fetchAssignments()
  }

  // Prepare grid data
  const gridData = assignments.map(a => [
    a.registration?.reference_number || a.registration_id.substring(0, 12) + '...',
    a.assignment_type,
    new Date(a.assignment_date).toLocaleDateString(),
    a.housing_reference || '-',
    a.notes || '-',
    new Date(a.recorded_at).toLocaleString()
  ])

  return (
    <>
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">Assignment Records</h5>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => setShowModal(true)}
            >
              <IconifyIcon icon="mingcute:add-line" className="me-1" />
              Record Assignment
            </Button>
          </div>

          {loading ? null : assignments.length === 0 ? (
            <div className="text-center text-muted py-4">
              No assignments recorded yet.
            </div>
          ) : (
            <Grid
              data={gridData}
              columns={[
                { name: 'Reference', width: '120px' },
                { 
                  name: 'Type', 
                  width: '100px',
                  formatter: (cell) => {
                    const type = String(cell)
                    return html(`<span class="badge bg-${TYPE_BADGES[type] || 'secondary'}">${type}</span>`)
                  }
                },
                { name: 'Assignment Date', width: '120px' },
                { name: 'Housing Ref', width: '150px' },
                { name: 'Notes', width: '200px' },
                { name: 'Recorded At', width: '150px' }
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

      <AssignmentFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSuccess={handleAssignmentCreated}
      />
    </>
  )
}

export default AssignmentTable
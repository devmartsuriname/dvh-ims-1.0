import { useEffect, useState } from 'react'
import { Card, CardBody, Button, Badge, Spinner } from 'react-bootstrap'
import { Grid, html } from 'gridjs'
import 'gridjs/dist/theme/mermaid.css'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'react-toastify'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import QuotaFormModal from './QuotaFormModal'
import { logAuditEvent } from '@/hooks/useAuditLog'

interface DistrictQuota {
  id: string
  district_code: string
  period_start: string
  period_end: string
  total_quota: number
  allocated_count: number
  created_by: string
  created_at: string
}

const QuotaTable = () => {
  const [quotas, setQuotas] = useState<DistrictQuota[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingQuota, setEditingQuota] = useState<DistrictQuota | null>(null)

  const fetchQuotas = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('district_quota')
      .select('*')
      .order('period_start', { ascending: false })

    if (error) {
      toast.error('Failed to load quotas')
      console.error(error)
    } else {
      setQuotas(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchQuotas()
  }, [])

  useEffect(() => {
    if (!loading && quotas.length >= 0) {
      const gridContainer = document.getElementById('quota-grid')
      if (gridContainer) {
        gridContainer.innerHTML = ''
        
        new Grid({
          columns: [
            { name: 'District', width: '120px' },
            { name: 'Period Start', width: '120px' },
            { name: 'Period End', width: '120px' },
            { name: 'Total Quota', width: '100px' },
            { name: 'Allocated', width: '100px' },
            { 
              name: 'Remaining', 
              width: '100px',
              formatter: (cell) => html(`<span class="badge bg-${Number(cell) > 0 ? 'success' : 'danger'}">${cell}</span>`)
            },
            {
              name: 'Actions',
              width: '100px',
              formatter: (_, row) => html(`
                <button class="btn btn-sm btn-soft-primary edit-quota" data-id="${row.cells[6].data}">
                  Edit
                </button>
              `)
            }
          ],
          data: quotas.map(q => [
            q.district_code,
            new Date(q.period_start).toLocaleDateString(),
            new Date(q.period_end).toLocaleDateString(),
            q.total_quota,
            q.allocated_count,
            q.total_quota - q.allocated_count,
            q.id
          ]),
          search: true,
          pagination: { limit: 10 },
          className: {
            table: 'table table-hover mb-0'
          }
        }).render(gridContainer)

        // Add click handler for edit buttons
        gridContainer.addEventListener('click', (e) => {
          const target = e.target as HTMLElement
          const editBtn = target.closest('.edit-quota')
          if (editBtn) {
            const id = editBtn.getAttribute('data-id')
            const quota = quotas.find(q => q.id === id)
            if (quota) {
              setEditingQuota(quota)
              setShowModal(true)
            }
          }
        })
      }
    }
  }, [loading, quotas])

  const handleSave = async (data: {
    district_code: string
    period_start: string
    period_end: string
    total_quota: number
  }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Not authenticated')
      return
    }

    if (editingQuota) {
      // Update existing
      const { error } = await supabase
        .from('district_quota')
        .update({
          district_code: data.district_code,
          period_start: data.period_start,
          period_end: data.period_end,
          total_quota: data.total_quota
        })
        .eq('id', editingQuota.id)

      if (error) {
        toast.error('Failed to update quota')
        console.error(error)
        return
      }

      await logAuditEvent({
        entityType: 'district_quota',
        entityId: editingQuota.id,
        action: 'UPDATE',
        metadata: { changes: data }
      })

      toast.success('Quota updated successfully')
    } else {
      // Create new
      const { data: newQuota, error } = await supabase
        .from('district_quota')
        .insert({
          district_code: data.district_code,
          period_start: data.period_start,
          period_end: data.period_end,
          total_quota: data.total_quota,
          created_by: user.id
        })
        .select()
        .single()

      if (error) {
        toast.error('Failed to create quota')
        console.error(error)
        return
      }

      await logAuditEvent({
        entityType: 'district_quota',
        entityId: newQuota.id,
        action: 'CREATE',
        metadata: data
      })

      toast.success('Quota created successfully')
    }

    setShowModal(false)
    setEditingQuota(null)
    fetchQuotas()
  }

  return (
    <>
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">District Quotas</h5>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => {
                setEditingQuota(null)
                setShowModal(true)
              }}
            >
              <IconifyIcon icon="mingcute:add-line" className="me-1" />
              New Quota
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <div id="quota-grid"></div>
          )}
        </CardBody>
      </Card>

      <QuotaFormModal
        show={showModal}
        onHide={() => {
          setShowModal(false)
          setEditingQuota(null)
        }}
        onSave={handleSave}
        editingQuota={editingQuota}
      />
    </>
  )
}

export default QuotaTable

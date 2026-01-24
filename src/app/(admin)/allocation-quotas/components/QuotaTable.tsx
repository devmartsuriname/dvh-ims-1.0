import { useEffect, useState, useCallback } from 'react'
import { Card, CardBody, Button, Spinner } from 'react-bootstrap'
import { Grid } from 'gridjs-react'
import { html } from 'gridjs'
import { supabase } from '@/integrations/supabase/client'
import { notify } from '@/utils/notify'
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
      notify.error('Failed to load quotas')
      console.error(error)
    } else {
      setQuotas(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchQuotas()
  }, [])

  const handleEditClick = useCallback((id: string) => {
    const quota = quotas.find(q => q.id === id)
    if (quota) {
      setEditingQuota(quota)
      setShowModal(true)
    }
  }, [quotas])

  // Event delegation for Edit button clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const editBtn = target.closest('[data-quota-edit]') as HTMLElement
      if (editBtn) {
        const id = editBtn.getAttribute('data-quota-edit')
        if (id) handleEditClick(id)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [handleEditClick])

  const handleSave = async (data: {
    district_code: string
    period_start: string
    period_end: string
    total_quota: number
  }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      notify.error('Not authenticated')
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
        notify.error('Failed to update quota')
        console.error(error)
        return
      }

      await logAuditEvent({
        entityType: 'district_quota',
        entityId: editingQuota.id,
        action: 'UPDATE',
        metadata: { changes: data }
      })

      notify.success('Quota updated successfully')
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
        notify.error('Failed to create quota')
        console.error(error)
        return
      }

      await logAuditEvent({
        entityType: 'district_quota',
        entityId: newQuota.id,
        action: 'CREATE',
        metadata: data
      })

      notify.success('Quota created successfully')
    }

    setShowModal(false)
    setEditingQuota(null)
    fetchQuotas()
  }

  // Prepare grid data
  const gridData = quotas.map(q => [
    q.district_code,
    new Date(q.period_start).toLocaleDateString(),
    new Date(q.period_end).toLocaleDateString(),
    q.total_quota,
    q.allocated_count,
    q.total_quota - q.allocated_count,
    q.id
  ])

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

          {loading ? null : quotas.length === 0 ? (
            <p className="text-muted text-center py-4">No district quotas found. Click "New Quota" to create one.</p>
          ) : (
            <Grid
              data={gridData}
              columns={[
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
                  formatter: (cell) => html(`
                    <button class="btn btn-sm btn-soft-primary" data-quota-edit="${cell}">
                      Edit
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
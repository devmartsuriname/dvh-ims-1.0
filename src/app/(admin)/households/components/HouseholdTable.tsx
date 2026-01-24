import { useEffect, useState, useCallback } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Button, Spinner } from 'react-bootstrap'
import { Grid } from 'gridjs-react'
import { html } from 'gridjs'
import { useNavigate } from 'react-router-dom'
import useToggle from '@/hooks/useToggle'
import HouseholdFormModal from './HouseholdFormModal'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { supabase } from '@/integrations/supabase/client'
import { notify } from '@/utils/notify'

interface Household {
  id: string
  primary_person_id: string
  household_size: number
  district_code: string
  created_at: string
  person?: {
    first_name: string
    last_name: string
  }
}

const HouseholdTable = () => {
  const [households, setHouseholds] = useState<Household[]>([])
  const [loading, setLoading] = useState(true)
  const { isTrue: isOpen, toggle } = useToggle()
  const navigate = useNavigate()

  const fetchHouseholds = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('household')
      .select(`
        *,
        person:primary_person_id (first_name, last_name)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching households:', error)
      notify.error('Failed to load households')
    } else {
      setHouseholds(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchHouseholds()
  }, [fetchHouseholds])

  // Event delegation for View button clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const viewBtn = target.closest('[data-household-view]') as HTMLElement
      if (viewBtn) {
        const id = viewBtn.getAttribute('data-household-view')
        if (id) handleView(id)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const handleAdd = () => {
    toggle()
  }

  const handleView = (id: string) => {
    navigate(`/households/${id}`)
  }

  const handleSuccess = () => {
    fetchHouseholds()
  }

  // Initial load handled by route-level Suspense
  if (loading) {
    return null
  }

  return (
    <>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <CardTitle as="h5">Households</CardTitle>
          <Button variant="primary" size="sm" onClick={handleAdd}>
            <IconifyIcon icon="mingcute:add-line" className="me-1" />
            Add Household
          </Button>
        </CardHeader>
        <CardBody>
          {households.length === 0 ? (
            <p className="text-muted text-center py-4">No households found. Click "Add Household" to create one.</p>
          ) : (
            <Grid
              data={households.map((h) => [
                h.person ? `${h.person.first_name} ${h.person.last_name}` : '-',
                h.household_size,
                h.district_code,
                new Date(h.created_at).toLocaleDateString(),
                h.id,
              ])}
              columns={[
                { name: 'Primary Person' },
                { name: 'Size' },
                { name: 'District' },
                { name: 'Created' },
                { 
                  name: 'Actions', 
                  sort: false,
                  formatter: (cell) => html(`
                    <button class="btn btn-sm btn-soft-primary" data-household-view="${cell}">
                      View
                    </button>
                  `)
                },
              ]}
              search
              pagination={{ limit: 10 }}
              sort
              className={{ table: 'table table-hover mb-0' }}
            />
          )}
        </CardBody>
      </Card>

      <HouseholdFormModal
        isOpen={isOpen}
        onClose={toggle}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default HouseholdTable

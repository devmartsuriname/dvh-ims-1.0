import { useEffect, useState, useCallback } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Button, Spinner, Badge } from 'react-bootstrap'
import { Grid } from 'gridjs-react'
import { html } from 'gridjs'
import { useNavigate } from 'react-router-dom'
import useToggle from '@/hooks/useToggle'
import RegistrationFormModal from './RegistrationFormModal'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { supabase } from '@/integrations/supabase/client'
import { notify } from '@/utils/notify'

interface HousingRegistration {
  id: string
  reference_number: string
  household_id: string
  applicant_person_id: string
  district_code: string
  current_status: string
  registration_date: string
  housing_type_preference: string | null
  urgency_score: number | null
  waiting_list_position: number | null
  created_at: string
  person?: {
    first_name: string
    last_name: string
    national_id: string
  }
}

const STATUS_BADGES: Record<string, { bg: string; label: string }> = {
  received: { bg: 'secondary', label: 'Received' },
  under_review: { bg: 'info', label: 'Under Review' },
  urgency_assessed: { bg: 'primary', label: 'Urgency Assessed' },
  waiting_list: { bg: 'warning', label: 'Waiting List' },
  matched: { bg: 'success', label: 'Matched' },
  allocated: { bg: 'dark', label: 'Allocated' },
  finalized: { bg: 'success', label: 'Finalized' },
  rejected: { bg: 'danger', label: 'Rejected' },
}

const RegistrationTable = () => {
  const [registrations, setRegistrations] = useState<HousingRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRegistration, setSelectedRegistration] = useState<HousingRegistration | undefined>()
  const { isTrue: isOpen, toggle } = useToggle()
  const navigate = useNavigate()

  const fetchRegistrations = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('housing_registration')
      .select(`
        *,
        person:applicant_person_id (
          first_name,
          last_name,
          national_id
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching registrations:', error)
      notify.error('Failed to load registrations')
    } else {
      setRegistrations(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRegistrations()
  }, [fetchRegistrations])

  const handleAdd = () => {
    setSelectedRegistration(undefined)
    toggle()
  }

  const handleSuccess = () => {
    fetchRegistrations()
  }

  if (loading) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </CardBody>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <CardTitle as="h5">Housing Registrations</CardTitle>
          <Button variant="primary" size="sm" onClick={handleAdd}>
            <IconifyIcon icon="mingcute:add-line" className="me-1" />
            New Registration
          </Button>
        </CardHeader>
        <CardBody>
          {registrations.length === 0 ? (
            <p className="text-muted text-center py-4">No housing registrations found. Click "New Registration" to create one.</p>
          ) : (
            <Grid
              data={registrations.map((r) => [
                r.reference_number,
                r.person ? `${r.person.first_name} ${r.person.last_name}` : '-',
                r.district_code,
                r.current_status,
                r.urgency_score ?? '-',
                r.waiting_list_position ?? '-',
                new Date(r.created_at).toLocaleDateString(),
                r.id,
              ])}
              columns={[
                { name: 'Reference #' },
                { name: 'Applicant' },
                { name: 'District' },
                { 
                  name: 'Status',
                  formatter: (cell: string) => {
                    const badge = STATUS_BADGES[cell] || { bg: 'secondary', label: cell }
                    return html(`<span class="badge bg-${badge.bg}">${badge.label}</span>`)
                  }
                },
                { name: 'Urgency' },
                { name: 'Wait #' },
                { name: 'Created' },
                { 
                  name: 'Actions', 
                  sort: false,
                  formatter: (cell: string) => html(`
                    <button class="btn btn-outline-primary btn-sm" onclick="window.location.href='/housing-registrations/${cell}'">
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

      <RegistrationFormModal
        isOpen={isOpen}
        onClose={toggle}
        onSuccess={handleSuccess}
        registration={selectedRegistration}
      />
    </>
  )
}

export default RegistrationTable

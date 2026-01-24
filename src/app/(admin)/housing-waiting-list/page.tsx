import { useEffect, useState, useCallback } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Spinner, Badge, Form, Row, Col } from 'react-bootstrap'
import { Grid } from 'gridjs-react'
import { html } from 'gridjs'
import PageTitle from '@/components/PageTitle'
import { supabase } from '@/integrations/supabase/client'

interface WaitingListEntry {
  id: string
  reference_number: string
  district_code: string
  current_status: string
  urgency_score: number | null
  waiting_list_position: number | null
  registration_date: string
  person?: {
    first_name: string
    last_name: string
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

const HousingWaitingList = () => {
  const [entries, setEntries] = useState<WaitingListEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [districtFilter, setDistrictFilter] = useState('')
  const [districts, setDistricts] = useState<string[]>([])

  const fetchWaitingList = useCallback(async () => {
    setLoading(true)
    
    let query = supabase
      .from('housing_registration')
      .select(`
        id,
        reference_number,
        district_code,
        current_status,
        urgency_score,
        waiting_list_position,
        registration_date,
        person:applicant_person_id (
          first_name,
          last_name
        )
      `)
      .in('current_status', ['waiting_list', 'urgency_assessed', 'matched'])
      .order('waiting_list_position', { ascending: true, nullsFirst: false })
      .order('urgency_score', { ascending: false })

    if (districtFilter) {
      query = query.eq('district_code', districtFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching waiting list:', error)
    } else {
      setEntries(data || [])
      
      // Extract unique districts for filter
      const uniqueDistricts = [...new Set((data || []).map(e => e.district_code))]
      setDistricts(uniqueDistricts)
    }
    setLoading(false)
  }, [districtFilter])

  useEffect(() => {
    fetchWaitingList()
  }, [fetchWaitingList])

  // Initial load handled by route-level Suspense
  if (loading) {
    return null
  }

  return (
    <>
      <PageTitle subName="Woning Registratie" title="Waiting List" />

      <Card className="mb-3">
        <CardHeader>
          <CardTitle as="h5">Filters</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>District</Form.Label>
                <Form.Select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                >
                  <option value="">All Districts</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <CardTitle as="h5">Housing Waiting List</CardTitle>
          <Badge bg="primary">{entries.length} entries</Badge>
        </CardHeader>
        <CardBody>
          {entries.length === 0 ? (
            <p className="text-muted text-center py-4">No entries in the waiting list</p>
          ) : (
            <Grid
              data={entries.map((e, index) => [
                e.waiting_list_position ?? index + 1,
                e.reference_number,
                e.person ? `${e.person.first_name} ${e.person.last_name}` : '-',
                e.district_code,
                e.urgency_score ?? 0,
                e.current_status,
                new Date(e.registration_date).toLocaleDateString(),
                e.id,
              ])}
              columns={[
                { name: '#', width: '60px' },
                { name: 'Reference' },
                { name: 'Applicant' },
                { name: 'District' },
                { 
                  name: 'Urgency',
                  formatter: (cell: number) => {
                    const bg = cell > 50 ? 'danger' : cell > 25 ? 'warning' : 'secondary'
                    return html(`<span class="badge bg-${bg}">${cell}</span>`)
                  }
                },
                { 
                  name: 'Status',
                  formatter: (cell: string) => {
                    const badge = STATUS_BADGES[cell] || { bg: 'secondary', label: cell }
                    return html(`<span class="badge bg-${badge.bg}">${badge.label}</span>`)
                  }
                },
                { name: 'Registered' },
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
              pagination={{ limit: 20 }}
              className={{ table: 'table table-hover mb-0' }}
            />
          )}
        </CardBody>
      </Card>
    </>
  )
}

export default HousingWaitingList

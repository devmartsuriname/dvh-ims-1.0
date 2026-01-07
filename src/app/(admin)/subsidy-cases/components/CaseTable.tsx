import { useEffect, useState, useCallback } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Button, Spinner, Badge } from 'react-bootstrap'
import { Grid } from 'gridjs-react'
import { html } from 'gridjs'
import { useNavigate } from 'react-router-dom'
import useToggle from '@/hooks/useToggle'
import CaseFormModal from './CaseFormModal'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { supabase } from '@/integrations/supabase/client'

interface SubsidyCase {
  id: string
  case_number: string
  household_id: string
  applicant_person_id: string
  status: string
  district_code: string
  requested_amount: number | null
  approved_amount: number | null
  created_at: string
  person?: {
    first_name: string
    last_name: string
    national_id: string
  }
}

const STATUS_BADGES: Record<string, { bg: string; label: string }> = {
  received: { bg: 'secondary', label: 'Received' },
  screening: { bg: 'info', label: 'Screening' },
  needs_more_docs: { bg: 'warning', label: 'Needs More Docs' },
  fieldwork: { bg: 'primary', label: 'Fieldwork' },
  approved_for_council: { bg: 'success', label: 'Approved for Council' },
  council_doc_generated: { bg: 'dark', label: 'Council Doc Generated' },
  finalized: { bg: 'success', label: 'Finalized' },
  rejected: { bg: 'danger', label: 'Rejected' },
}

const CaseTable = () => {
  const [cases, setCases] = useState<SubsidyCase[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCase, setSelectedCase] = useState<SubsidyCase | undefined>()
  const { isTrue: isOpen, toggle } = useToggle()
  const navigate = useNavigate()

  const fetchCases = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('subsidy_case')
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
      console.error('Error fetching cases:', error)
    } else {
      setCases(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCases()
  }, [fetchCases])

  const handleAdd = () => {
    setSelectedCase(undefined)
    toggle()
  }

  const handleSuccess = () => {
    fetchCases()
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
          <CardTitle as="h5">Subsidy Cases</CardTitle>
          <Button variant="primary" size="sm" onClick={handleAdd}>
            <IconifyIcon icon="mingcute:add-line" className="me-1" />
            New Case
          </Button>
        </CardHeader>
        <CardBody>
          {cases.length === 0 ? (
            <p className="text-muted text-center py-4">No subsidy cases found. Click "New Case" to create one.</p>
          ) : (
            <Grid
              data={cases.map((c) => [
                c.case_number,
                c.person ? `${c.person.first_name} ${c.person.last_name}` : '-',
                c.person?.national_id || '-',
                c.district_code,
                c.status,
                c.requested_amount ? `SRD ${c.requested_amount.toLocaleString()}` : '-',
                new Date(c.created_at).toLocaleDateString(),
                c.id,
              ])}
              columns={[
                { name: 'Case #' },
                { name: 'Applicant' },
                { name: 'National ID' },
                { name: 'District' },
                { 
                  name: 'Status',
                  formatter: (cell: string) => {
                    const badge = STATUS_BADGES[cell] || { bg: 'secondary', label: cell }
                    return html(`<span class="badge bg-${badge.bg}">${badge.label}</span>`)
                  }
                },
                { name: 'Requested Amount' },
                { name: 'Created' },
                { 
                  name: 'Actions', 
                  sort: false,
                  formatter: (cell: string) => html(`
                    <button class="btn btn-outline-primary btn-sm" onclick="window.location.href='/subsidy-cases/${cell}'">
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

      <CaseFormModal
        isOpen={isOpen}
        onClose={toggle}
        onSuccess={handleSuccess}
        subsidyCase={selectedCase}
      />
    </>
  )
}

export default CaseTable

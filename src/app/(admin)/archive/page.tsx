import { useEffect, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Card, CardBody, CardHeader, CardTitle, Spinner, Badge, Tab, Tabs, Table } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
import { supabase } from '@/integrations/supabase/client'
import { useUserRole } from '@/hooks/useUserRole'
import type { AppRole } from '@/hooks/useUserRole'

const ALLOWED_ROLES: AppRole[] = ['system_admin', 'minister', 'project_leader', 'director', 'ministerial_advisor', 'audit']

const SUBSIDY_STATUS_BADGES: Record<string, { bg: string; label: string }> = {
  finalized: { bg: 'success', label: 'Finalized' },
  rejected: { bg: 'danger', label: 'Rejected' },
}

const HOUSING_STATUS_BADGES: Record<string, { bg: string; label: string }> = {
  finalized: { bg: 'success', label: 'Finalized' },
  rejected: { bg: 'danger', label: 'Rejected' },
}

interface ArchivedSubsidyCase {
  id: string
  case_number: string
  status: string
  district_code: string
  created_at: string
  updated_at: string
  person?: { first_name: string; last_name: string }
}

interface ArchivedHousingRegistration {
  id: string
  reference_number: string
  current_status: string
  district_code: string
  registration_date: string
  updated_at: string
  person?: { first_name: string; last_name: string }
}

const ArchiveListPage = () => {
  const navigate = useNavigate()
  const { loading: roleLoading, hasAnyRole } = useUserRole()
  const [subsidyCases, setSubsidyCases] = useState<ArchivedSubsidyCase[]>([])
  const [housingRegistrations, setHousingRegistrations] = useState<ArchivedHousingRegistration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArchiveData = async () => {
      setLoading(true)
      const [subsidyRes, housingRes] = await Promise.all([
        supabase
          .from('subsidy_case')
          .select('id, case_number, status, district_code, created_at, updated_at, person:applicant_person_id (first_name, last_name)')
          .in('status', ['finalized', 'rejected'])
          .order('updated_at', { ascending: false }),
        supabase
          .from('housing_registration')
          .select('id, reference_number, current_status, district_code, registration_date, updated_at, person:applicant_person_id (first_name, last_name)')
          .in('current_status', ['finalized', 'rejected'])
          .order('updated_at', { ascending: false }),
      ])
      setSubsidyCases((subsidyRes.data as unknown as ArchivedSubsidyCase[]) || [])
      setHousingRegistrations((housingRes.data as unknown as ArchivedHousingRegistration[]) || [])
      setLoading(false)
    }
    fetchArchiveData()
  }, [])

  if (roleLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>
      </div>
    )
  }

  if (!hasAnyRole(ALLOWED_ROLES)) {
    return <Navigate to="/dashboards" replace />
  }

  return (
    <>
      <PageTitle subName="Governance" title="Archive" />

      <Tabs defaultActiveKey="bouwsubsidie" className="mb-3">
        <Tab eventKey="bouwsubsidie" title={`Bouwsubsidie (${subsidyCases.length})`}>
          <Card>
            <CardHeader>
              <CardTitle as="h5">Archived Subsidy Cases</CardTitle>
            </CardHeader>
            <CardBody>
              {loading ? (
                <div className="text-center py-4"><Spinner animation="border" size="sm" /></div>
              ) : subsidyCases.length === 0 ? (
                <p className="text-muted text-center py-4">No archived subsidy cases</p>
              ) : (
                <Table hover responsive className="cursor-pointer">
                  <thead>
                    <tr>
                      <th>Case Number</th>
                      <th>Applicant</th>
                      <th>District</th>
                      <th>Status</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subsidyCases.map((c) => {
                      const badge = SUBSIDY_STATUS_BADGES[c.status] || { bg: 'secondary', label: c.status }
                      return (
                        <tr key={c.id} onClick={() => navigate(`/archive/subsidy/${c.id}`)} style={{ cursor: 'pointer' }}>
                          <td className="fw-medium">{c.case_number}</td>
                          <td>{c.person ? `${c.person.first_name} ${c.person.last_name}` : '-'}</td>
                          <td>{c.district_code}</td>
                          <td><Badge bg={badge.bg}>{badge.label}</Badge></td>
                          <td>{new Date(c.updated_at).toLocaleDateString()}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Tab>

        <Tab eventKey="woningregistratie" title={`Woningregistratie (${housingRegistrations.length})`}>
          <Card>
            <CardHeader>
              <CardTitle as="h5">Archived Housing Registrations</CardTitle>
            </CardHeader>
            <CardBody>
              {loading ? (
                <div className="text-center py-4"><Spinner animation="border" size="sm" /></div>
              ) : housingRegistrations.length === 0 ? (
                <p className="text-muted text-center py-4">No archived housing registrations</p>
              ) : (
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th>Reference Number</th>
                      <th>Applicant</th>
                      <th>District</th>
                      <th>Status</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {housingRegistrations.map((r) => {
                      const badge = HOUSING_STATUS_BADGES[r.current_status] || { bg: 'secondary', label: r.current_status }
                      return (
                        <tr key={r.id} onClick={() => navigate(`/archive/housing/${r.id}`)} style={{ cursor: 'pointer' }}>
                          <td className="fw-medium">{r.reference_number}</td>
                          <td>{r.person ? `${r.person.first_name} ${r.person.last_name}` : '-'}</td>
                          <td>{r.district_code}</td>
                          <td><Badge bg={badge.bg}>{badge.label}</Badge></td>
                          <td>{new Date(r.updated_at).toLocaleDateString()}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </>
  )
}

export default ArchiveListPage

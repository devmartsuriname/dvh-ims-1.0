import PageTitle from '@/components/PageTitle'
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Alert } from 'react-bootstrap'
import { Grid } from 'gridjs-react'
import { html } from 'gridjs'
import { useScheduleVisits } from '@/hooks/useScheduleVisits'
import { useUserRole } from '@/hooks/useUserRole'
import type { AppRole } from '@/hooks/useUserRole'

const STATUS_BADGES: Record<string, { bg: string; label: string }> = {
  in_social_review: { bg: 'info', label: 'Social Review' },
  in_technical_review: { bg: 'info', label: 'Technical Review' },
  fieldwork: { bg: 'primary', label: 'Fieldwork' },
}

const ROLE_BADGES: Record<string, { bg: string; label: string }> = {
  social_field_worker: { bg: 'info', label: 'Social Worker' },
  technical_inspector: { bg: 'warning', label: 'Technical Inspector' },
}

const ALLOWED_ROLES: AppRole[] = ['admin_staff', 'project_leader', 'system_admin', 'audit']

const ScheduleVisitsPage = () => {
  const { pendingCases, fieldWorkers, loading } = useScheduleVisits()
  const { roles, loading: roleLoading } = useUserRole()

  if (loading || roleLoading) return null

  const hasAccess = roles.some((r) => ALLOWED_ROLES.includes(r))

  if (!hasAccess) {
    return (
      <>
        <PageTitle subName="Bouwsubsidie" title="Schedule Visits" />
        <Alert variant="danger">
          You do not have permission to view this page.
        </Alert>
      </>
    )
  }

  return (
    <>
      <PageTitle subName="Bouwsubsidie" title="Schedule Visits" />
      <p className="text-muted mb-3">
        This page is a read-only planning overview. It does not assign cases, does not alter workflows, and does not influence decision-making.
      </p>
      <Row>
        <Col lg={8}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle as="h5">Cases Pending Visits</CardTitle>
              <span className="text-muted">{pendingCases.length} case(s)</span>
            </CardHeader>
            <CardBody>
              {pendingCases.length === 0 ? (
                <p className="text-muted text-center py-4">No cases pending visits.</p>
              ) : (
                <Grid
                  data={pendingCases.map((c) => [
                    c.case_number,
                    c.applicant_name,
                    c.address,
                    c.district_code,
                    c.status,
                  ])}
                  columns={[
                    { name: 'Case #' },
                    { name: 'Applicant' },
                    { name: 'Address' },
                    { name: 'District' },
                    {
                      name: 'Status',
                      formatter: (cell: string) => {
                        const badge = STATUS_BADGES[cell] || { bg: 'secondary', label: cell }
                        return html(`<span class="badge bg-${badge.bg}">${badge.label}</span>`)
                      },
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
        </Col>
        <Col lg={4}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle as="h5">Available Field Workers</CardTitle>
              <span className="text-muted">{fieldWorkers.length} worker(s)</span>
            </CardHeader>
            <CardBody>
              {fieldWorkers.length === 0 ? (
                <p className="text-muted text-center py-4">No field workers found.</p>
              ) : (
                <Grid
                  data={fieldWorkers.map((w) => [
                    w.full_name,
                    w.role,
                    w.district_code,
                  ])}
                  columns={[
                    { name: 'Name' },
                    {
                      name: 'Role',
                      formatter: (cell: string) => {
                        const badge = ROLE_BADGES[cell] || { bg: 'secondary', label: cell }
                        return html(`<span class="badge bg-${badge.bg}">${badge.label}</span>`)
                      },
                    },
                    { name: 'District' },
                  ]}
                  pagination={{ limit: 10 }}
                  sort
                  className={{ table: 'table table-hover mb-0' }}
                />
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default ScheduleVisitsPage

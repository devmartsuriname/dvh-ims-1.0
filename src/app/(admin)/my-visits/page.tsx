import PageTitle from '@/components/PageTitle'
import { Card, CardBody, CardHeader, CardTitle, Badge } from 'react-bootstrap'
import { Grid } from 'gridjs-react'
import { html } from 'gridjs'
import { useMyVisits } from '@/hooks/useMyVisits'

const REPORT_BADGES: Record<string, { bg: string; label: string }> = {
  none: { bg: 'secondary', label: 'Not Started' },
  draft: { bg: 'warning', label: 'Draft' },
  finalized: { bg: 'success', label: 'Finalized' },
}

const MyVisitsPage = () => {
  const { items, loading, isSocial, isTechnical } = useMyVisits()

  const visitType = isSocial ? 'Social' : isTechnical ? 'Technical' : ''

  if (loading) return null

  if (!isSocial && !isTechnical) {
    return (
      <>
        <PageTitle subName="Bouwsubsidie" title="My Visits" />
        <Card>
          <CardBody className="text-center py-5">
            <p className="text-muted">This page is only available to Social Field Workers and Technical Inspectors.</p>
          </CardBody>
        </Card>
      </>
    )
  }

  return (
    <>
      <PageTitle subName="Bouwsubsidie" title="My Visits" />
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <CardTitle as="h5">
            My Visits
            <Badge bg="soft-info" className="ms-2 badge-soft-info">
              {visitType} Visits
            </Badge>
          </CardTitle>
          <span className="text-muted">{items.length} visit(s)</span>
        </CardHeader>
        <CardBody>
          {items.length === 0 ? (
            <p className="text-muted text-center py-4">No visits pending at this time.</p>
          ) : (
            <Grid
              data={items.map((item) => [
                item.case_number,
                item.applicant_name,
                item.address,
                item.district_code,
                item.report_status,
                item.id,
              ])}
              columns={[
                { name: 'Case #' },
                { name: 'Applicant' },
                { name: 'Address' },
                { name: 'District' },
                {
                  name: 'Report Status',
                  formatter: (cell: string) => {
                    const badge = REPORT_BADGES[cell] || { bg: 'secondary', label: cell }
                    return html(`<span class="badge bg-${badge.bg}">${badge.label}</span>`)
                  },
                },
                {
                  name: 'Actions',
                  sort: false,
                  formatter: (cell: string) =>
                    html(`<button class="btn btn-outline-primary btn-sm" onclick="window.location.href='/subsidy-cases/${cell}'">View Case</button>`),
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
    </>
  )
}

export default MyVisitsPage

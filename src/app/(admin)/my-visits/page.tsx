import { useEffect } from 'react'
import PageTitle from '@/components/PageTitle'
import { Card, CardBody, CardHeader, CardTitle, Badge } from 'react-bootstrap'
import { Grid } from 'gridjs-react'
import { html } from 'gridjs'
import { useMyVisits } from '@/hooks/useMyVisits'
import { toast } from 'react-toastify'
import { VISIT_TYPE_BADGES } from '@/constants/statusBadges'

const REPORT_BADGES: Record<string, { bg: string; label: string }> = {
  none: { bg: 'secondary', label: 'Not Started' },
  draft: { bg: 'warning', label: 'Draft' },
  finalized: { bg: 'success', label: 'Finalized' },
}

const MyVisitsPage = () => {
  const { items, scheduledVisits, loading, isSocial, isTechnical, completeVisit, completing } = useMyVisits()

  const visitType = isSocial ? 'Social' : isTechnical ? 'Technical' : ''

  // Expose complete handler for gridjs
  useEffect(() => {
    ;(window as any).__completeVisit = async (visitId: string) => {
      if (!confirm('Mark this visit as completed?')) return
      const result = await completeVisit(visitId)
      if (result.error) {
        toast.error(`Failed: ${result.error}`)
      } else {
        toast.success('Visit marked as completed.')
      }
    }
    return () => {
      delete (window as any).__completeVisit
    }
  }, [completeVisit])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

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

      {/* Scheduled Inspection Visits */}
      {scheduledVisits.length > 0 && (
        <Card className="mb-3">
          <CardHeader className="d-flex justify-content-between align-items-center">
            <CardTitle as="h5">
              Scheduled Visits
              <Badge bg="soft-primary" className="ms-2 badge-soft-primary">
                Upcoming
              </Badge>
            </CardTitle>
            <span className="text-muted">{scheduledVisits.length} visit(s)</span>
          </CardHeader>
          <CardBody>
            <Grid
              data={scheduledVisits.map((v) => [
                v.case_number,
                v.applicant_name,
                v.visit_type,
                v.scheduled_date,
                v.id,
              ])}
              columns={[
                { name: 'Case #' },
                { name: 'Applicant' },
                {
                  name: 'Type',
                  formatter: (cell: string) => {
                    const badge = VISIT_TYPE_BADGES[cell] || { bg: 'secondary', label: cell }
                    return html(`<span class="badge bg-${badge.bg}">${badge.label}</span>`)
                  },
                },
                { name: 'Date' },
                {
                  name: 'Actions',
                  sort: false,
                  formatter: (cell: string) =>
                    html(`<button class="btn btn-outline-success btn-sm" onclick="window.__completeVisit('${cell}')">Complete</button>
                           <button class="btn btn-outline-primary btn-sm ms-1" onclick="window.location.href='/subsidy-cases/${cell}'">View</button>`),
                },
              ]}
              pagination={{ limit: 10 }}
              sort
              className={{ table: 'table table-hover mb-0' }}
            />
          </CardBody>
        </Card>
      )}

      {/* Existing case-based visits */}
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <CardTitle as="h5">
            My Cases
            <Badge bg="soft-info" className="ms-2 badge-soft-info">
              {visitType} Cases
            </Badge>
          </CardTitle>
          <span className="text-muted">{items.length} case(s)</span>
        </CardHeader>
        <CardBody>
          {items.length === 0 ? (
            <p className="text-muted text-center py-4">No cases assigned at this time.</p>
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

import PageTitle from '@/components/PageTitle'
import { Card, CardBody, CardHeader, CardTitle, Badge } from 'react-bootstrap'
import { Grid } from 'gridjs-react'
import { html } from 'gridjs'
import { useControlQueue } from '@/hooks/useControlQueue'
import { useUserRole } from '@/hooks/useUserRole'

const STATUS_BADGES: Record<string, { bg: string; label: string }> = {
  received: { bg: 'secondary', label: 'Received' },
  returned_to_intake: { bg: 'warning', label: 'Returned to Intake' },
  needs_more_docs: { bg: 'warning', label: 'Needs More Docs' },
  in_social_review: { bg: 'info', label: 'Social Review' },
  returned_to_social: { bg: 'warning', label: 'Returned to Social' },
  in_technical_review: { bg: 'info', label: 'Technical Review' },
  returned_to_technical: { bg: 'warning', label: 'Returned to Technical' },
  in_admin_review: { bg: 'info', label: 'Admin Review' },
  screening: { bg: 'info', label: 'Screening' },
  fieldwork: { bg: 'primary', label: 'Fieldwork' },
  awaiting_director_approval: { bg: 'primary', label: 'Awaiting Director' },
  returned_to_director: { bg: 'warning', label: 'Returned to Director' },
  in_ministerial_advice: { bg: 'primary', label: 'Ministerial Advice' },
  returned_to_advisor: { bg: 'warning', label: 'Returned to Advisor' },
  awaiting_minister_decision: { bg: 'primary', label: 'Awaiting Minister' },
  approved_for_council: { bg: 'success', label: 'Approved for Council' },
  council_doc_generated: { bg: 'dark', label: 'Council Doc Generated' },
  finalized: { bg: 'success', label: 'Finalized' },
  rejected: { bg: 'danger', label: 'Rejected' },
}

function urgencyBadge(days: number): string {
  if (days >= 15) return `<span class="badge bg-danger">${days}d</span>`
  if (days >= 8) return `<span class="badge bg-warning">${days}d</span>`
  return `<span class="text-muted">${days}d</span>`
}

const ControlQueuePage = () => {
  const { items, loading } = useControlQueue()
  const { roles } = useUserRole()

  const roleLabel = roles.length > 0 ? roles[0].replace(/_/g, ' ') : ''

  if (loading) return null

  return (
    <>
      <PageTitle subName="Bouwsubsidie" title="Control Queue" />
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <CardTitle as="h5">
            Control Queue
            {roleLabel && (
              <Badge bg="soft-primary" className="ms-2 badge-soft-primary text-capitalize">
                {roleLabel}
              </Badge>
            )}
          </CardTitle>
          <span className="text-muted">{items.length} case(s)</span>
        </CardHeader>
        <CardBody>
          {items.length === 0 ? (
            <p className="text-muted text-center py-4">No cases require your attention at this time.</p>
          ) : (
            <Grid
              data={items.map((item) => [
                item.case_number,
                item.applicant_name,
                item.district_code,
                item.status,
                item.days_in_status,
                item.id,
              ])}
              columns={[
                { name: 'Case #' },
                { name: 'Applicant' },
                { name: 'District' },
                {
                  name: 'Status',
                  formatter: (cell: string) => {
                    const badge = STATUS_BADGES[cell] || { bg: 'secondary', label: cell }
                    return html(`<span class="badge bg-${badge.bg}">${badge.label}</span>`)
                  },
                },
                {
                  name: 'Days in Status',
                  formatter: (cell: number) => html(urgencyBadge(cell)),
                },
                {
                  name: 'Actions',
                  sort: false,
                  formatter: (cell: string) =>
                    html(`<button class="btn btn-outline-primary btn-sm" onclick="window.location.href='/subsidy-cases/${cell}'">View</button>`),
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

export default ControlQueuePage

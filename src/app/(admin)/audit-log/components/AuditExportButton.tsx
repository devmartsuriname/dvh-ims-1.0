import { Button } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { format } from 'date-fns'
import type { AuditEvent, AuditEventFilters } from '@/hooks/useAuditEvents'

interface AuditExportButtonProps {
  events: AuditEvent[]
  filters: AuditEventFilters
}

const AuditExportButton = ({ events, filters }: AuditExportButtonProps) => {
  const handleExport = () => {
    if (events.length === 0) return

    // CSV Headers
    const headers = [
      'Timestamp',
      'Actor Name',
      'Actor ID',
      'Actor Role',
      'Action',
      'Entity Type',
      'Entity ID',
      'Reason',
    ]

    // CSV Rows
    const rows = events.map((event) => [
      event.occurred_at,
      event.actor_name || 'System/Public',
      event.actor_user_id || '',
      event.actor_role || '',
      event.action,
      event.entity_type,
      event.entity_id || '',
      event.reason || '',
    ])

    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    // Generate filename with date and filter info
    const dateStr = format(new Date(), 'yyyy-MM-dd')
    let filename = `audit_log_export_${dateStr}`

    // Add filter indicators to filename
    if (filters.action) filename += `_${filters.action}`
    if (filters.entityType) filename += `_${filters.entityType}`
    filename += '.csv'

    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button
      variant="outline-primary"
      size="sm"
      onClick={handleExport}
      disabled={events.length === 0}
    >
      <Icon icon="mingcute:download-2-line" className="me-1" />
      Export CSV
    </Button>
  )
}

export default AuditExportButton

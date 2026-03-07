import { Button } from 'react-bootstrap'
import { Icon } from '@iconify/react'
import { format } from 'date-fns'

interface ExportHeader {
  key: string
  label: string
}

interface ArchiveExportButtonsProps {
  data: Array<Record<string, any>>
  headers: ExportHeader[]
  filenamePrefix: string
  disabled?: boolean
}

const ArchiveExportButtons = ({ data, headers, filenamePrefix, disabled }: ArchiveExportButtonsProps) => {
  const isDisabled = disabled || data.length === 0

  const handleCsvExport = () => {
    if (data.length === 0) return

    const headerRow = headers.map((h) => h.label)
    const rows = data.map((row) =>
      headers.map((h) => {
        const val = row[h.key]
        return `"${String(val ?? '').replace(/"/g, '""')}"`
      })
    )

    const csvContent = [headerRow.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const dateStr = format(new Date(), 'yyyy-MM-dd')

    link.setAttribute('href', url)
    link.setAttribute('download', `${filenamePrefix}_${dateStr}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handlePdfExport = () => {
    if (data.length === 0) return

    const dateStr = format(new Date(), 'yyyy-MM-dd HH:mm')
    const title = filenamePrefix.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const tableRows = data
      .map(
        (row) =>
          `<tr>${headers.map((h) => `<td style="border:1px solid #ccc;padding:6px 10px;font-size:12px;">${row[h.key] ?? '-'}</td>`).join('')}</tr>`
      )
      .join('')

    const html = `<!DOCTYPE html>
<html><head><title>${title} Export</title>
<style>
  body { font-family: Arial, sans-serif; margin: 20px; }
  h1 { font-size: 18px; margin-bottom: 4px; }
  .meta { font-size: 12px; color: #666; margin-bottom: 16px; }
  table { border-collapse: collapse; width: 100%; }
  th { border: 1px solid #999; padding: 6px 10px; background: #f5f5f5; font-size: 12px; text-align: left; }
  td { border: 1px solid #ccc; padding: 6px 10px; font-size: 12px; }
  tr:nth-child(even) { background: #fafafa; }
  @media print { body { margin: 0; } }
</style></head>
<body>
  <h1>${title}</h1>
  <div class="meta">Exported: ${dateStr} &bull; ${data.length} record(s)</div>
  <table>
    <thead><tr>${headers.map((h) => `<th>${h.label}</th>`).join('')}</tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
  <script>window.onload=function(){window.print();window.onafterprint=function(){window.close();}}</script>
</body></html>`

    printWindow.document.write(html)
    printWindow.document.close()
  }

  return (
    <div className="d-flex gap-2">
      <Button variant="outline-primary" size="sm" onClick={handleCsvExport} disabled={isDisabled}>
        <Icon icon="mingcute:download-2-line" className="me-1" />
        Export CSV
      </Button>
      <Button variant="outline-secondary" size="sm" onClick={handlePdfExport} disabled={isDisabled}>
        <Icon icon="mingcute:printer-line" className="me-1" />
        Export PDF
      </Button>
    </div>
  )
}

export default ArchiveExportButtons

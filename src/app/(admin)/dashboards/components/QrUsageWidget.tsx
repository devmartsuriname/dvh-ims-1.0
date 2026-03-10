import { useEffect, useState } from 'react'
import { Card, CardBody } from 'react-bootstrap'
import ReactApexChart from 'react-apexcharts'
import { supabase } from '@/integrations/supabase/client'
import type { ApexOptions } from 'apexcharts'

interface ScanCounts {
  today: number
  week: number
  month: number
}

interface QrMetrics {
  woningregistratie: ScanCounts
  bouwsubsidie: ScanCounts
  total: ScanCounts
}

const QrUsageWidget = () => {
  const [metrics, setMetrics] = useState<QrMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

        const { data, error } = await supabase
          .from('qr_scan_event')
          .select('qr_type, scanned_at')
          .gte('scanned_at', monthAgo)

        if (error) {
          console.error('Error fetching QR metrics:', error)
          setLoading(false)
          return
        }

        const rows = data || []
        const calc = (type: string | null): ScanCounts => {
          const filtered = type ? rows.filter((r) => r.qr_type === type) : rows
          return {
            today: filtered.filter((r) => r.scanned_at >= todayStart).length,
            week: filtered.filter((r) => r.scanned_at >= weekAgo).length,
            month: filtered.length,
          }
        }

        setMetrics({
          woningregistratie: calc('woningregistratie'),
          bouwsubsidie: calc('bouwsubsidie'),
          total: calc(null),
        })
      } catch (err) {
        console.error('QR metrics error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'inherit',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ['Today', 'Last 7 Days', 'Last 30 Days'],
    },
    colors: ['#3762ea', '#1cb7a0'],
    legend: {
      position: 'top',
    },
    tooltip: {
      y: { formatter: (val: number) => `${val} scans` },
    },
  }

  const chartSeries = metrics
    ? [
        {
          name: 'Woning Registratie',
          data: [metrics.woningregistratie.today, metrics.woningregistratie.week, metrics.woningregistratie.month],
        },
        {
          name: 'Bouwsubsidie',
          data: [metrics.bouwsubsidie.today, metrics.bouwsubsidie.week, metrics.bouwsubsidie.month],
        },
      ]
    : []

  if (loading) {
    return (
      <Card>
        <CardBody>
          <h5 className="card-title mb-3">QR Code Usage</h5>
          <div className="text-center py-4">Loading...</div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">QR Code Usage</h5>
          {metrics && (
            <span className="badge bg-primary-subtle text-primary">
              {metrics.total.month} total scans (30d)
            </span>
          )}
        </div>

        {metrics && (
          <div className="row mb-3">
            <div className="col-4 text-center">
              <h4 className="mb-1">{metrics.total.today}</h4>
              <p className="text-muted mb-0 small">Today</p>
            </div>
            <div className="col-4 text-center">
              <h4 className="mb-1">{metrics.total.week}</h4>
              <p className="text-muted mb-0 small">7 Days</p>
            </div>
            <div className="col-4 text-center">
              <h4 className="mb-1">{metrics.total.month}</h4>
              <p className="text-muted mb-0 small">30 Days</p>
            </div>
          </div>
        )}

        <ReactApexChart
          options={chartOptions}
          series={chartSeries}
          type="bar"
          height={280}
        />
      </CardBody>
    </Card>
  )
}

export default QrUsageWidget

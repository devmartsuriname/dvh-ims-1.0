import { ApexOptions } from 'apexcharts'
import ReactApexChart from 'react-apexcharts'
import { Card, CardBody, CardHeader, Col } from 'react-bootstrap'
import { useStatusBreakdown, TimeRange } from '../hooks/useDashboardData'

interface SaleChartProps {
  timeRange: TimeRange
}

const SaleChart = ({ timeRange }: SaleChartProps) => {
  const { data: statusData, loading } = useStatusBreakdown(timeRange)

  // Map status data to chart series and labels
  const series = loading 
    ? [33.33, 33.33, 33.34]
    : statusData.map(s => s.percentage)
  
  const labels = loading 
    ? ['Received', 'Approved', 'Rejected']
    : statusData.map(s => s.status)

  const SaleChartOptions: ApexOptions = {
    chart: {
      height: 180,
      type: 'donut',
    },
    series: series,
    legend: {
      show: false,
    },
    stroke: {
      width: 0,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: false,
            total: {
              showAlways: true,
              show: true,
            },
          },
        },
      },
    },
    labels: labels,
    colors: ['#7e67fe', '#17c553', '#dc3545'],
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
        },
      },
    ],
    fill: {
      type: 'gradient',
    },
  }

  // Get badge class based on status
  const getBadgeClass = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'approved') return 'badge-soft-success'
    if (s === 'rejected') return 'badge-soft-danger'
    return 'badge-soft-primary'
  }

  // Time range options - displayed as visual indicators (synced with Monthly Trends)
  const timeRangeOptions: TimeRange[] = ['ALL', '1M', '6M', '1Y']

  return (
    <>
      <Col lg={4}>
        <Card>
          <CardHeader className=" d-flex align-items-center justify-content-between gap-2">
            <h4 className="card-title flex-grow-1 mb-0">Cases by Status</h4>
            <div>
              {/* Buttons shown as visual indicators of current selection (read-only) */}
              {timeRangeOptions.map((range) => (
                <button
                  key={range}
                  type="button"
                  className={`btn btn-sm btn-outline-light ${timeRange === range ? 'active' : ''}`}
                  disabled
                  style={{ opacity: timeRange === range ? 1 : 0.5 }}
                >
                  {range}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardBody>
            <div dir="ltr">
              <div id="conversions" className="apex-charts">
                <ReactApexChart height={180} options={SaleChartOptions} series={SaleChartOptions.series} type="donut" />
              </div>
            </div>
            <div className="table-responsive mb-n1 mt-2">
              <table className="table table-nowrap table-borderless table-sm table-centered mb-0">
                <thead className="bg-light bg-opacity-50 thead-sm">
                  <tr>
                    <th className="py-1">Status</th>
                    <th className="py-1">Count</th>
                    <th className="py-1">Perc.</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="text-center text-muted">Loading...</td>
                    </tr>
                  ) : statusData.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center text-muted">No data</td>
                    </tr>
                  ) : (
                    statusData.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.status}</td>
                        <td>{item.count.toLocaleString()}</td>
                        <td>
                          {item.percentage.toFixed(2)}%
                          <span className={`badge ${getBadgeClass(item.status)} float-end`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* end table-responsive*/}
          </CardBody>
        </Card>{' '}
        {/* end card*/}
      </Col>
    </>
  )
}

export default SaleChart

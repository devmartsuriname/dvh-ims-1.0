import { ApexOptions } from 'apexcharts'
import ReactApexChart from 'react-apexcharts'
import CountryMap from './CountryMap'
import { Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap'
import SaleChart from './SaleChart'
import { useMonthlyTrends, TimeRange } from '../hooks/useDashboardData'

interface ChartProps {
  timeRange: TimeRange
  onTimeRangeChange: (range: TimeRange) => void
}

const Chart = ({ timeRange, onTimeRangeChange }: ChartProps) => {
  const { data: monthlyData, loading } = useMonthlyTrends(timeRange)

  // Extract series data from monthly trends
  const registrationsSeries = loading 
    ? [34, 65, 46, 68, 49, 61, 42, 44, 78, 52, 63, 67]
    : monthlyData.map(m => m.registrations)
  
  const subsidySeries = loading
    ? [8, 12, 7, 17, 21, 11, 5, 9, 7, 29, 12, 35]
    : monthlyData.map(m => m.subsidyCases)
  
  const allocationsSeries = loading
    ? [12, 16, 11, 22, 28, 25, 15, 29, 35, 45, 42, 48]
    : monthlyData.map(m => m.allocations)

  const salesChart: ApexOptions = {
    series: [
      {
        name: 'Housing Registrations',
        type: 'bar',
        data: registrationsSeries,
      },
      {
        name: 'Subsidy Cases',
        type: 'area',
        data: subsidySeries,
      },
      {
        name: 'Allocations',
        type: 'area',
        data: allocationsSeries,
      },
    ],
    chart: {
      height: 330,
      type: 'line',
      toolbar: {
        show: false,
      },
    },
    stroke: {
      dashArray: [0, 0, 2],
      width: [0, 2, 2],
      curve: 'smooth',
    },
    fill: {
      opacity: [1, 1, 1],
      type: ['solid', 'gradient', 'gradient'],
      gradient: {
        type: 'vertical',
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [0, 90],
      },
    },
    markers: {
      size: [0, 0],
      strokeWidth: 2,
      hover: {
        size: 4,
      },
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      min: 0,
      axisBorder: {
        show: false,
      },
    },
    grid: {
      show: true,
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: 0,
        right: -2,
        bottom: 10,
        left: 10,
      },
    },
    legend: {
      show: true,
      horizontalAlign: 'center',
      offsetX: 0,
      offsetY: 5,
      itemMargin: {
        horizontal: 10,
        vertical: 0,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: '30%',
        barHeight: '70%',
        borderRadius: 3,
      },
    },
    colors: ['#7e67fe', '#17c553', '#7942ed'],
    tooltip: {
      shared: true,
      y: [
        {
          formatter: function (y) {
            if (typeof y !== 'undefined') {
              return y.toFixed(0) + ' cases'
            }
            return y
          },
        },
        {
          formatter: function (y) {
            if (typeof y !== 'undefined') {
              return y.toFixed(0) + ' cases'
            }
            return y
          },
        },
        {
          formatter: function (y) {
            if (typeof y !== 'undefined') {
              return y.toFixed(0) + ' allocations'
            }
            return y
          },
        },
      ],
    },
  }

  // Time range options for the filter buttons
  const timeRangeOptions: TimeRange[] = ['ALL', '1M', '6M', '1Y']

  return (
    <>
      <Row>
        <Col lg={4}>
          <Card className=" card-height-100 ">
            <CardHeader className="d-flex align-items-center justify-content-between gap-2">
              <h4 className=" mb-0 flex-grow-1 mb-0">Monthly Trends</h4>
              <div>
                {timeRangeOptions.map((range) => (
                  <button
                    key={range}
                    type="button"
                    className={`btn btn-sm btn-outline-light ${timeRange === range ? 'active' : ''}`}
                    onClick={() => onTimeRangeChange(range)}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div dir="ltr">
                <div id="dash-performance-chart" className="apex-charts">
                  <ReactApexChart options={salesChart} series={salesChart.series} height={313} type="area" className="apex-charts " />
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <SaleChart timeRange={timeRange} />
        <CountryMap />
      </Row>
    </>
  )
}

export default Chart

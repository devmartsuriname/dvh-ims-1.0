import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { ApexOptions } from 'apexcharts'
import ReactApexChart from 'react-apexcharts'
import { Card, CardBody, Col, Row } from 'react-bootstrap'
import { cardsData, CardsType, createCardsData } from '../data'
import { useDashboardKPIs, useSparklineData, TimeRange } from '../hooks/useDashboardData'

const StatCard = ({ count, icon, series, title }: CardsType) => {
  const salesChart: ApexOptions = {
    chart: {
      type: 'area',
      height: 50,
      sparkline: {
        enabled: true,
      },
    },
    series: [
      {
        data: series,
      },
    ],
    stroke: {
      width: 2,
      curve: 'smooth',
    },
    markers: {
      size: 0,
    },
    colors: ['#7e67fe'],
    tooltip: {
      fixed: {
        enabled: false,
      },
      x: {
        show: false,
      },
      y: {
        title: {
          formatter: function () {
            return ''
          },
        },
      },
      marker: {
        show: false,
      },
    },
    fill: {
      opacity: [1],
      type: ['gradient'],
      gradient: {
        type: 'vertical',
        //   shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [0, 100],
      },
    },
  }

  return (
    <Card>
      <CardBody>
        <Row>
          <Col xs={6}>
            <p className="text-muted mb-0 text-truncate">{title}</p>
            <h3 className="text-dark mt-2 mb-0">{count}</h3>
          </Col>
          <Col xs={6}>
            <div className="ms-auto avatar-md bg-soft-primary rounded">
              <IconifyIcon style={{ padding: '12px' }} icon={icon} className="fs-32 avatar-title text-primary" />
            </div>
          </Col>
        </Row>
      </CardBody>
      <ReactApexChart options={salesChart} series={salesChart.series} height={50} type="area" />
    </Card>
  )
}

const Cards = () => {
  // KPI Sparklines use a stable fixed time range ('1Y')
  // This is decoupled from chart TimeRange controls (Monthly Trends, Cases-by-Status)
  // Sparklines do NOT change when chart buttons are clicked
  const SPARKLINE_TIME_RANGE: TimeRange = '1Y'
  
  const kpis = useDashboardKPIs()
  const sparklines = useSparklineData(SPARKLINE_TIME_RANGE)
  
  // Use real data when loaded, fallback to static during loading
  const displayData = kpis.loading || sparklines.loading
    ? cardsData 
    : createCardsData(
        {
          totalRegistrations: kpis.totalRegistrations,
          totalSubsidyCases: kpis.totalSubsidyCases,
          pendingApplications: kpis.pendingApplications,
          approvedApplications: kpis.approvedApplications,
        },
        sparklines.data
      )

  return (
    <>
      <Row>
        {displayData.map((item, idx) => (
          <Col md={6} xl={3} key={idx}>
            <StatCard {...item} />
          </Col>
        ))}
      </Row>
    </>
  )
}

export default Cards

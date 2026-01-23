'use client'
import Footer from '@/components/layout/Footer'
import Cards from './components/Cards'
import Chart from './components/Chart'
import User from './components/User'
import PageTitle from '@/components/PageTitle'

const page = () => {
  // TimeRange state is now managed per-widget (not globally)
  // - Monthly Trends: owns trendsRange (local in Chart.tsx)
  // - Cases-by-Status: owns statusRange (local in SaleChart.tsx)
  // - KPI Sparklines: use fixed '1Y' constant (decoupled)

  return (
    <>
      <PageTitle subName="VolksHuisvesting IMS" title="Dashboard" />
      <Cards />
      <Chart />
      <User />
      <Footer />
    </>
  )
}

export default page

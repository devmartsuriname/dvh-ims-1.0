'use client'
import { useState } from 'react'
import Footer from '@/components/layout/Footer'
import Cards from './components/Cards'
import Chart from './components/Chart'
import User from './components/User'
import PageTitle from '@/components/PageTitle'
import { TimeRange } from './hooks/useDashboardData'

const page = () => {
  // Shared time range state for Monthly Trends and Cases-by-Status charts
  // Default to '1Y' (last 365 days) as the initial view
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y')

  return (
    <>
      <PageTitle subName="Darkone" title="Dashboard" />
      <Cards timeRange={timeRange} />
      <Chart timeRange={timeRange} onTimeRangeChange={setTimeRange} />
      <User />
      <Footer />
    </>
  )
}

export default page

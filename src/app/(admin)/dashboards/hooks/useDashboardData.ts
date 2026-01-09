import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

// Time range filter type for dashboard charts
// ALL = no date constraint, 1M = last 30 days, 6M = last 180 days, 1Y = last 365 days
export type TimeRange = 'ALL' | '1M' | '6M' | '1Y'

// Calculate UTC cutoff date based on time range
// Returns null for 'ALL' (no constraint), or ISO string for date-constrained ranges
export const getTimeRangeCutoff = (range: TimeRange): string | null => {
  if (range === 'ALL') return null
  
  const now = new Date()
  const days = range === '1M' ? 30 : range === '6M' ? 180 : 365
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  return cutoff.toISOString()
}

// Sparkline data structure for KPI cards
export interface SparklineData {
  registrations: number[]
  subsidyCases: number[]
  pendingCases: number[]
  approvedCases: number[]
}

// Determine bucket configuration based on time range
// 1M: 30 daily points, 6M: 26 weekly points, 1Y/ALL: 12 monthly points
const getSparklineBuckets = (range: TimeRange): { count: number; type: 'day' | 'week' | 'month' } => {
  switch (range) {
    case '1M': return { count: 30, type: 'day' }
    case '6M': return { count: 26, type: 'week' }
    case '1Y':
    case 'ALL':
    default: return { count: 12, type: 'month' }
  }
}

// Hook to fetch sparkline data for KPI cards
// Returns time-bucketed arrays for each KPI metric
export const useSparklineData = (timeRange: TimeRange = '1Y'): { data: SparklineData; loading: boolean } => {
  const [data, setData] = useState<SparklineData>({
    registrations: [],
    subsidyCases: [],
    pendingCases: [],
    approvedCases: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSparklineData = async () => {
      try {
        const cutoff = getTimeRangeCutoff(timeRange)
        const { count: bucketCount, type: bucketType } = getSparklineBuckets(timeRange)
        
        // Fetch raw timestamps from housing_registration
        let regQuery = supabase.from('housing_registration').select('created_at')
        if (cutoff) {
          regQuery = regQuery.gte('created_at', cutoff)
        }
        const { data: registrations } = await regQuery
        
        // Fetch raw timestamps from subsidy_case (all, pending, approved)
        let subQuery = supabase.from('subsidy_case').select('created_at, status')
        if (cutoff) {
          subQuery = subQuery.gte('created_at', cutoff)
        }
        const { data: subsidyCases } = await subQuery
        
        // Generate bucket boundaries
        const now = new Date()
        const buckets: { start: Date; end: Date }[] = []
        
        for (let i = bucketCount - 1; i >= 0; i--) {
          let start: Date
          let end: Date
          
          if (bucketType === 'day') {
            // Daily buckets
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 0, 0, 0)
            end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 23, 59, 59, 999)
          } else if (bucketType === 'week') {
            // Weekly buckets
            const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
            start = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate(), 0, 0, 0)
            end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1)
          } else {
            // Monthly buckets
            start = new Date(now.getFullYear(), now.getMonth() - i, 1, 0, 0, 0)
            end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999)
          }
          
          buckets.push({ start, end })
        }
        
        // Aggregate into buckets
        const regSeries: number[] = []
        const subSeries: number[] = []
        const pendingSeries: number[] = []
        const approvedSeries: number[] = []
        
        for (const bucket of buckets) {
          // Count registrations in bucket
          const regCount = registrations?.filter(r => {
            const date = new Date(r.created_at)
            return date >= bucket.start && date <= bucket.end
          }).length || 0
          regSeries.push(regCount)
          
          // Count all subsidy cases in bucket
          const subCount = subsidyCases?.filter(s => {
            const date = new Date(s.created_at)
            return date >= bucket.start && date <= bucket.end
          }).length || 0
          subSeries.push(subCount)
          
          // Count pending cases in bucket (status = 'received' or 'pending_documents')
          const pendingCount = subsidyCases?.filter(s => {
            const date = new Date(s.created_at)
            return date >= bucket.start && date <= bucket.end && 
                   (s.status === 'received' || s.status === 'pending_documents')
          }).length || 0
          pendingSeries.push(pendingCount)
          
          // Count approved cases in bucket
          const approvedCount = subsidyCases?.filter(s => {
            const date = new Date(s.created_at)
            return date >= bucket.start && date <= bucket.end && s.status === 'approved'
          }).length || 0
          approvedSeries.push(approvedCount)
        }
        
        setData({
          registrations: regSeries,
          subsidyCases: subSeries,
          pendingCases: pendingSeries,
          approvedCases: approvedSeries,
        })
      } catch (error) {
        console.error('Error fetching sparkline data:', error)
        // Return zero-filled arrays on error
        const { count } = getSparklineBuckets(timeRange)
        setData({
          registrations: new Array(count).fill(0),
          subsidyCases: new Array(count).fill(0),
          pendingCases: new Array(count).fill(0),
          approvedCases: new Array(count).fill(0),
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSparklineData()
  }, [timeRange])

  return { data, loading }
}

// Suriname district coordinates for the map
export const SURINAME_DISTRICTS = [
  { name: 'Paramaribo', coords: [5.852, -55.203], code: 'PM' },
  { name: 'Wanica', coords: [5.733, -55.250], code: 'WA' },
  { name: 'Nickerie', coords: [5.933, -56.983], code: 'NI' },
  { name: 'Coronie', coords: [5.933, -56.283], code: 'CO' },
  { name: 'Saramacca', coords: [5.817, -55.667], code: 'SA' },
  { name: 'Commewijne', coords: [5.833, -54.883], code: 'CM' },
  { name: 'Marowijne', coords: [5.617, -54.250], code: 'MA' },
  { name: 'Para', coords: [5.467, -55.217], code: 'PA' },
  { name: 'Brokopondo', coords: [5.050, -55.083], code: 'BR' },
  { name: 'Sipaliwini', coords: [3.883, -56.183], code: 'SI' },
]

export interface DashboardKPIs {
  totalRegistrations: number
  totalSubsidyCases: number
  pendingApplications: number
  approvedApplications: number
  rejectedApplications: number
  loading: boolean
}

export interface MonthlyData {
  month: string
  registrations: number
  subsidyCases: number
  allocations: number
}

export interface DistrictApplications {
  districtCode: string
  districtName: string
  coords: [number, number]
  count: number
}

export interface StatusBreakdown {
  status: string
  count: number
  percentage: number
}

export const useDashboardKPIs = (): DashboardKPIs => {
  const [data, setData] = useState<DashboardKPIs>({
    totalRegistrations: 0,
    totalSubsidyCases: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    loading: true,
  })

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        // Fetch housing registrations count
        const { count: registrationsCount } = await supabase
          .from('housing_registration')
          .select('*', { count: 'exact', head: true })

        // Fetch subsidy cases count
        const { count: subsidyCount } = await supabase
          .from('subsidy_case')
          .select('*', { count: 'exact', head: true })

        // Fetch pending (status = 'received' OR 'pending_documents')
        // Both statuses represent cases awaiting processing
        const { count: pendingCount } = await supabase
          .from('subsidy_case')
          .select('*', { count: 'exact', head: true })
          .in('status', ['received', 'pending_documents'])

        // Fetch approved
        const { count: approvedCount } = await supabase
          .from('subsidy_case')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved')

        // Fetch rejected
        const { count: rejectedCount } = await supabase
          .from('subsidy_case')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'rejected')

        setData({
          totalRegistrations: registrationsCount || 0,
          totalSubsidyCases: subsidyCount || 0,
          pendingApplications: pendingCount || 0,
          approvedApplications: approvedCount || 0,
          rejectedApplications: rejectedCount || 0,
          loading: false,
        })
      } catch (error) {
        console.error('Error fetching dashboard KPIs:', error)
        setData(prev => ({ ...prev, loading: false }))
      }
    }

    fetchKPIs()
  }, [])

  return data
}

// Monthly Trends hook with time range filtering
// Accepts TimeRange parameter to filter data at Supabase query level
export const useMonthlyTrends = (timeRange: TimeRange = '1Y'): { data: MonthlyData[]; loading: boolean } => {
  const [trends, setTrends] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const cutoff = getTimeRangeCutoff(timeRange)
        
        // Build queries with optional date constraint
        let regQuery = supabase.from('housing_registration').select('created_at')
        let subQuery = supabase.from('subsidy_case').select('created_at')
        let allocQuery = supabase.from('allocation_decision').select('decided_at')
        
        // Apply time range filter if not 'ALL'
        if (cutoff) {
          regQuery = regQuery.gte('created_at', cutoff)
          subQuery = subQuery.gte('created_at', cutoff)
          allocQuery = allocQuery.gte('decided_at', cutoff)
        }

        const { data: registrations } = await regQuery
        const { data: subsidyCases } = await subQuery
        const { data: allocations } = await allocQuery

        // Group by month
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const monthlyData: MonthlyData[] = months.map((month, idx) => {
          const regCount = registrations?.filter(r => new Date(r.created_at).getMonth() === idx).length || 0
          const subCount = subsidyCases?.filter(s => new Date(s.created_at).getMonth() === idx).length || 0
          const allocCount = allocations?.filter(a => new Date(a.decided_at).getMonth() === idx).length || 0

          return {
            month,
            registrations: regCount,
            subsidyCases: subCount,
            allocations: allocCount,
          }
        })

        setTrends(monthlyData)
      } catch (error) {
        console.error('Error fetching monthly trends:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrends()
  }, [timeRange]) // Re-fetch when timeRange changes

  return { data: trends, loading }
}

export const useDistrictApplications = (): { data: DistrictApplications[]; loading: boolean } => {
  const [districtData, setDistrictData] = useState<DistrictApplications[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDistrictData = async () => {
      try {
        // Fetch registrations by district
        const { data: registrations } = await supabase
          .from('housing_registration')
          .select('district_code')

        // Fetch subsidy cases by district
        const { data: subsidyCases } = await supabase
          .from('subsidy_case')
          .select('district_code')

        // District code alias mapping (database codes → UI codes)
        // Database may use 3-letter codes (PAR, WAA, NIC, etc.)
        // UI map uses 2-letter codes (PM, WA, NI, etc.)
        const DISTRICT_CODE_ALIASES: Record<string, string> = {
          'PAR': 'PM', // Paramaribo
          'WAA': 'WA', // Wanica
          'NIC': 'NI', // Nickerie
          'COR': 'CO', // Coronie
          'SAR': 'SA', // Saramacca
          'COM': 'CM', // Commewijne
          'MAR': 'MA', // Marowijne
          'PAB': 'PA', // Para
          'BRO': 'BR', // Brokopondo
          'SIP': 'SI', // Sipaliwini
        }

        // Normalize district code to UI code
        const normalizeCode = (code: string): string => {
          return DISTRICT_CODE_ALIASES[code] || code
        }

        // Combine and count by normalized district code
        const districtCounts: Record<string, number> = {}
        
        registrations?.forEach(r => {
          const normalizedCode = normalizeCode(r.district_code)
          districtCounts[normalizedCode] = (districtCounts[normalizedCode] || 0) + 1
        })
        
        subsidyCases?.forEach(s => {
          const normalizedCode = normalizeCode(s.district_code)
          districtCounts[normalizedCode] = (districtCounts[normalizedCode] || 0) + 1
        })

        // Map to district data with coordinates
        const mappedData = SURINAME_DISTRICTS.map(district => ({
          districtCode: district.code,
          districtName: district.name,
          coords: district.coords as [number, number],
          count: districtCounts[district.code] || 0,
        }))

        setDistrictData(mappedData)
      } catch (error) {
        console.error('Error fetching district applications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDistrictData()
  }, [])

  return { data: districtData, loading }
}

// Status Breakdown hook with time range filtering
// Accepts TimeRange parameter to filter subsidy cases at Supabase query level
export const useStatusBreakdown = (timeRange: TimeRange = '1Y'): { data: StatusBreakdown[]; loading: boolean } => {
  const [statusData, setStatusData] = useState<StatusBreakdown[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatusBreakdown = async () => {
      try {
        const cutoff = getTimeRangeCutoff(timeRange)
        
        // Build query with optional date constraint
        let query = supabase.from('subsidy_case').select('status, created_at')
        
        // Apply time range filter if not 'ALL'
        if (cutoff) {
          query = query.gte('created_at', cutoff)
        }
        
        const { data: cases } = await query

        if (!cases || cases.length === 0) {
          setStatusData([
            { status: 'Received', count: 0, percentage: 33.33 },
            { status: 'Approved', count: 0, percentage: 33.33 },
            { status: 'Rejected', count: 0, percentage: 33.34 },
          ])
          setLoading(false)
          return
        }

        const total = cases.length
        const statusCounts: Record<string, number> = {}
        
        cases.forEach(c => {
          statusCounts[c.status] = (statusCounts[c.status] || 0) + 1
        })

        const breakdown = Object.entries(statusCounts).map(([status, count]) => ({
          status: status.charAt(0).toUpperCase() + status.slice(1),
          count,
          percentage: (count / total) * 100,
        }))

        setStatusData(breakdown)
      } catch (error) {
        console.error('Error fetching status breakdown:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatusBreakdown()
  }, [timeRange]) // Re-fetch when timeRange changes

  return { data: statusData, loading }
}

export const useRecentCases = () => {
  const [cases, setCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentCases = async () => {
      try {
        const { data } = await supabase
          .from('subsidy_case')
          .select(`
            id,
            case_number,
            status,
            created_at,
            district_code,
            person:applicant_person_id (
              first_name,
              last_name
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5)

        setCases(data || [])
      } catch (error) {
        console.error('Error fetching recent cases:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentCases()
  }, [])

  return { data: cases, loading }
}

export const useRecentRegistrations = () => {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentRegistrations = async () => {
      try {
        const { data } = await supabase
          .from('housing_registration')
          .select(`
            id,
            reference_number,
            current_status,
            created_at,
            district_code,
            person:applicant_person_id (
              first_name,
              last_name
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5)

        setRegistrations(data || [])
      } catch (error) {
        console.error('Error fetching recent registrations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentRegistrations()
  }, [])

  return { data: registrations, loading }
}

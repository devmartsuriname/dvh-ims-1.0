export type CardsType = {
  title: string
  count: string
  icon: string
  series: number[]
}

// Default demo series for sparklines (structure preserved)
const defaultSeries = [25, 28, 32, 38, 43, 55, 60, 48, 42, 51, 35]

// Helper to create cards data from real KPIs
export const createCardsData = (kpis: {
  totalRegistrations: number
  totalSubsidyCases: number
  pendingApplications: number
  approvedApplications: number
}): CardsType[] => [
  {
    title: 'Housing Registrations',
    count: kpis.totalRegistrations.toLocaleString(),
    icon: 'solar:home-2-broken',
    series: defaultSeries,
  },
  {
    title: 'Subsidy Applications',
    count: kpis.totalSubsidyCases.toLocaleString(),
    icon: 'solar:document-text-broken',
    series: defaultSeries,
  },
  {
    title: 'Pending Applications',
    count: kpis.pendingApplications.toLocaleString(),
    icon: 'solar:clock-circle-broken',
    series: defaultSeries,
  },
  {
    title: 'Approved Applications',
    count: kpis.approvedApplications.toLocaleString(),
    icon: 'solar:check-circle-broken',
    series: defaultSeries,
  },
]

// Fallback static data (used during loading)
export const cardsData: CardsType[] = [
  {
    title: 'Housing Registrations',
    count: '—',
    icon: 'solar:home-2-broken',
    series: defaultSeries,
  },
  {
    title: 'Subsidy Applications',
    count: '—',
    icon: 'solar:document-text-broken',
    series: defaultSeries,
  },
  {
    title: 'Pending Applications',
    count: '—',
    icon: 'solar:clock-circle-broken',
    series: defaultSeries,
  },
  {
    title: 'Approved Applications',
    count: '—',
    icon: 'solar:check-circle-broken',
    series: defaultSeries,
  },
]

import { lazy } from 'react'
import { type RouteProps } from 'react-router-dom'

// Public Routes (Citizen-facing, Light Theme)
const LandingPage = lazy(() => import('@/app/(public)/landing/page'))
const BouwsubsidieWizard = lazy(() => import('@/app/(public)/bouwsubsidie/apply/page'))
const HousingWizard = lazy(() => import('@/app/(public)/housing/register/page'))
const StatusTracker = lazy(() => import('@/app/(public)/status/page'))

const Dashboards = lazy(() => import('@/app/(admin)/dashboards/page'))

// Shared Core Routes
const PersonList = lazy(() => import('@/app/(admin)/persons/page'))
const PersonDetail = lazy(() => import('@/app/(admin)/persons/[id]/page'))
const HouseholdList = lazy(() => import('@/app/(admin)/households/page'))
const HouseholdDetail = lazy(() => import('@/app/(admin)/households/[id]/page'))
const SubsidyCaseList = lazy(() => import('@/app/(admin)/subsidy-cases/page'))
const SubsidyCaseDetail = lazy(() => import('@/app/(admin)/subsidy-cases/[id]/page'))
const ControlQueue = lazy(() => import('@/app/(admin)/control-queue/page'))
const MyVisits = lazy(() => import('@/app/(admin)/my-visits/page'))
const ScheduleVisits = lazy(() => import('@/app/(admin)/schedule-visits/page'))
const CaseAssignments = lazy(() => import('@/app/(admin)/case-assignments/page'))

// Woning Registratie Routes
const HousingRegistrationList = lazy(() => import('@/app/(admin)/housing-registrations/page'))
const HousingRegistrationDetail = lazy(() => import('@/app/(admin)/housing-registrations/[id]/page'))
const HousingWaitingList = lazy(() => import('@/app/(admin)/housing-waiting-list/page'))

// Allocation Engine Routes
const AllocationQuotas = lazy(() => import('@/app/(admin)/allocation-quotas/page'))
const AllocationRuns = lazy(() => import('@/app/(admin)/allocation-runs/page'))
const AllocationRunDetail = lazy(() => import('@/app/(admin)/allocation-runs/[id]/page'))
const AllocationDecisions = lazy(() => import('@/app/(admin)/allocation-decisions/page'))
const AllocationAssignments = lazy(() => import('@/app/(admin)/allocation-assignments/page'))

// Governance Routes
const AuditLog = lazy(() => import('@/app/(admin)/audit-log/page'))
const ArchiveList = lazy(() => import('@/app/(admin)/archive/page'))
const ArchiveSubsidyDetail = lazy(() => import('@/app/(admin)/archive/subsidy/[id]/page'))
const ArchiveHousingDetail = lazy(() => import('@/app/(admin)/archive/housing/[id]/page'))

// Auth Routes
const AuthSignIn = lazy(() => import('@/app/(other)/auth/sign-in/page'))
const AuthSignUp = lazy(() => import('@/app/(other)/auth/sign-up/page'))
const ResetPassword = lazy(() => import('@/app/(other)/auth/reset-password/page'))
const Error404 = lazy(() => import('@/app/(other)/error-pages/pages-404/page'))

export type RoutesProps = {
  path: RouteProps['path']
  name: string
  element: RouteProps['element']
  exact?: boolean
}

/**
 * Public Routes - Citizen-facing pages with light theme
 * These routes are rendered inside PublicLayout (scoped light theme)
 * NO authentication required
 */
export const publicRoutes: RoutesProps[] = [
  { path: '/', name: 'Landing', element: <LandingPage /> },
  { path: '/bouwsubsidie/apply', name: 'Bouwsubsidie Wizard', element: <BouwsubsidieWizard /> },
  { path: '/housing/register', name: 'Housing Wizard', element: <HousingWizard /> },
  { path: '/status', name: 'Status Tracker', element: <StatusTracker /> },
]

/**
 * Admin Routes - Internal staff pages with dark theme
 * These routes require authentication and use AdminLayout
 */

const generalRoutes: RoutesProps[] = [
  {
    path: '/dashboards',
    name: 'Dashboards',
    element: <Dashboards />,
  },
]

export const authRoutes: RoutesProps[] = [
  {
    name: 'Sign In',
    path: '/auth/sign-in',
    element: <AuthSignIn />,
  },
  {
    name: 'Sign Up',
    path: '/auth/sign-up',
    element: <AuthSignUp />,
  },
  {
    name: 'Reset Password',
    path: '/auth/reset-password',
    element: <ResetPassword />,
  },
  {
    name: '404 Error',
    path: '/error-pages/pages-404',
    element: <Error404 />,
  },
]

const sharedCoreRoutes: RoutesProps[] = [
  { path: '/persons', name: 'Persons', element: <PersonList /> },
  { path: '/persons/:id', name: 'Person Detail', element: <PersonDetail /> },
  { path: '/households', name: 'Households', element: <HouseholdList /> },
  { path: '/households/:id', name: 'Household Detail', element: <HouseholdDetail /> },
]

const bouwsubsidieRoutes: RoutesProps[] = [
  { path: '/control-queue', name: 'Control Queue', element: <ControlQueue /> },
  { path: '/my-visits', name: 'My Visits', element: <MyVisits /> },
  { path: '/schedule-visits', name: 'Schedule Visits', element: <ScheduleVisits /> },
  { path: '/subsidy-cases', name: 'Subsidy Cases', element: <SubsidyCaseList /> },
  { path: '/subsidy-cases/:id', name: 'Subsidy Case Detail', element: <SubsidyCaseDetail /> },
  { path: '/case-assignments', name: 'Case Assignments', element: <CaseAssignments /> },
]

const woningRegistratieRoutes: RoutesProps[] = [
  { path: '/housing-registrations', name: 'Housing Registrations', element: <HousingRegistrationList /> },
  { path: '/housing-registrations/:id', name: 'Registration Detail', element: <HousingRegistrationDetail /> },
  { path: '/housing-waiting-list', name: 'Waiting List', element: <HousingWaitingList /> },
]

const allocationRoutes: RoutesProps[] = [
  { path: '/allocation-quotas', name: 'District Quotas', element: <AllocationQuotas /> },
  { path: '/allocation-runs', name: 'Allocation Runs', element: <AllocationRuns /> },
  { path: '/allocation-runs/:id', name: 'Run Detail', element: <AllocationRunDetail /> },
  { path: '/allocation-decisions', name: 'Allocation Decisions', element: <AllocationDecisions /> },
  { path: '/allocation-assignments', name: 'Assignment Registration', element: <AllocationAssignments /> },
]

const governanceRoutes: RoutesProps[] = [
  { path: '/archive', name: 'Archive', element: <ArchiveList /> },
  { path: '/archive/subsidy/:id', name: 'Archive Subsidy Detail', element: <ArchiveSubsidyDetail /> },
  { path: '/archive/housing/:id', name: 'Archive Housing Detail', element: <ArchiveHousingDetail /> },
  { path: '/audit-log', name: 'Audit Log', element: <AuditLog /> },
]

export const appRoutes = [
  ...governanceRoutes,
  ...sharedCoreRoutes,
  ...bouwsubsidieRoutes,
  ...woningRegistratieRoutes,
  ...allocationRoutes,
  ...generalRoutes,
]

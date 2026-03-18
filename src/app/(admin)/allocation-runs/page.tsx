import { Navigate } from 'react-router-dom'
import PageTitle from '@/components/PageTitle'
import type { AppRole } from '@/hooks/useUserRole'
import { useUserRole } from '@/hooks/useUserRole'
import RunTable from './components/RunTable'

const ALLOWED_ROLES: AppRole[] = ['system_admin', 'project_leader']

const AllocationRuns = () => {
  const { loading, hasAnyRole } = useUserRole()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!hasAnyRole(ALLOWED_ROLES)) {
    return <Navigate to="/dashboards" replace />
  }

  return (
    <>
      <PageTitle subName="Allocation Engine" title="Allocation Runs" />
      <RunTable />
    </>
  )
}

export default AllocationRuns

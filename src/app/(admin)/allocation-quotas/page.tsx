import { Navigate } from 'react-router-dom'
import PageTitle from '@/components/PageTitle'
import type { AppRole } from '@/hooks/useUserRole'
import { useUserRole } from '@/hooks/useUserRole'
import QuotaTable from './components/QuotaTable'

const ALLOWED_ROLES: AppRole[] = ['system_admin', 'minister', 'project_leader', 'frontdesk_housing', 'admin_staff', 'audit']

const AllocationQuotas = () => {
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
      <PageTitle subName="Allocation Engine" title="District Quotas" />
      <QuotaTable />
    </>
  )
}

export default AllocationQuotas

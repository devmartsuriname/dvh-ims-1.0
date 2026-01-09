import { Navigate } from 'react-router-dom'
import PageTitle from '@/components/PageTitle'
import { useUserRole } from '@/hooks/useUserRole'
import AuditLogTable from './components/AuditLogTable'

const ALLOWED_ROLES = ['system_admin', 'minister', 'project_leader', 'audit'] as const

const AuditLogPage = () => {
  const { roles, loading, hasAnyRole } = useUserRole()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  // Access control - redirect if not authorized
  if (!hasAnyRole([...ALLOWED_ROLES])) {
    return <Navigate to="/dashboards" replace />
  }

  return (
    <>
      <PageTitle subName="Governance" title="Audit Log" />
      <AuditLogTable />
    </>
  )
}

export default AuditLogPage

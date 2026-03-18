import { Navigate } from 'react-router-dom'
import PageTitle from '@/components/PageTitle'
import type { AppRole } from '@/hooks/useUserRole'
import { useUserRole } from '@/hooks/useUserRole'
import CaseTable from './components/CaseTable'

const ALLOWED_ROLES: AppRole[] = ['system_admin', 'minister', 'project_leader', 'frontdesk_bouwsubsidie', 'social_field_worker', 'technical_inspector', 'admin_staff', 'audit', 'director', 'ministerial_advisor']

const SubsidyCaseList = () => {
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
      <PageTitle subName="Bouwsubsidie" title="Subsidy Cases" />
      <CaseTable />
    </>
  )
}

export default SubsidyCaseList

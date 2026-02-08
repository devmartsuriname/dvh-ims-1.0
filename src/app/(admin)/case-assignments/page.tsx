import { useState, useEffect, useCallback } from 'react'
import { Card, Button, Badge, Table } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
import { useCaseAssignments, type CaseAssignment } from '@/hooks/useCaseAssignments'
import { useUserRole } from '@/hooks/useUserRole'
import { supabase } from '@/integrations/supabase/client'
import AssignmentFormModal from './components/AssignmentFormModal'
import RevokeModal from './components/RevokeModal'

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case 'assigned': return 'primary'
    case 'reassigned': return 'warning'
    case 'completed': return 'success'
    case 'revoked': return 'danger'
    default: return 'secondary'
  }
}

const CaseAssignmentsPage = () => {
  const { canWrite, fetchAssignments, assignWorker, revokeAssignment, completeAssignment, loading } = useCaseAssignments()
  const { loading: roleLoading } = useUserRole()
  const [assignments, setAssignments] = useState<CaseAssignment[]>([])
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<CaseAssignment | null>(null)
  const [actionType, setActionType] = useState<'revoke' | 'complete'>('revoke')

  // Lookup maps for display
  const [caseNumbers, setCaseNumbers] = useState<Record<string, string>>({})
  const [userNames, setUserNames] = useState<Record<string, string>>({})

  const loadAssignments = useCallback(async () => {
    const data = await fetchAssignments()
    setAssignments(data)

    // Resolve case numbers
    const caseIds = [...new Set(data.map(a => a.subsidy_case_id))]
    if (caseIds.length > 0) {
      const { data: cases } = await supabase
        .from('subsidy_case')
        .select('id, case_number')
        .in('id', caseIds)
      const map: Record<string, string> = {}
      cases?.forEach(c => { map[c.id] = c.case_number })
      setCaseNumbers(map)
    }

    // Resolve user names
    const userIds = [...new Set([...data.map(a => a.assigned_user_id), ...data.map(a => a.assigned_by)])]
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('app_user_profile')
        .select('user_id, full_name')
        .in('user_id', userIds)
      const map: Record<string, string> = {}
      profiles?.forEach(p => { map[p.user_id] = p.full_name })
      setUserNames(map)
    }
  }, [fetchAssignments])

  useEffect(() => {
    if (!roleLoading) {
      loadAssignments()
    }
  }, [roleLoading, loadAssignments])

  const handleAction = (assignment: CaseAssignment, action: 'revoke' | 'complete') => {
    setSelectedAssignment(assignment)
    setActionType(action)
    setShowActionModal(true)
  }

  return (
    <>
      <PageTitle subName="Bouwsubsidie" title="Case Assignments" />

      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="header-title mb-0">Assignment Overview</h4>
          {canWrite && (
            <Button variant="primary" size="sm" onClick={() => setShowAssignModal(true)}>
              <i className="mdi mdi-plus me-1" /> Assign Worker
            </Button>
          )}
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : assignments.length === 0 ? (
            <div className="text-center text-muted py-4">No assignments found</div>
          ) : (
            <div className="table-responsive">
              <Table className="table-centered mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Case #</th>
                    <th>Assigned Worker</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Assigned By</th>
                    <th>Date</th>
                    <th>Reason</th>
                    {canWrite && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {assignments.map(a => (
                    <tr key={a.id}>
                      <td>{caseNumbers[a.subsidy_case_id] || a.subsidy_case_id.slice(0, 8)}</td>
                      <td>{userNames[a.assigned_user_id] || a.assigned_user_id.slice(0, 8)}</td>
                      <td>{a.assigned_role.replace(/_/g, ' ')}</td>
                      <td>
                        <Badge bg={statusBadgeVariant(a.assignment_status)}>
                          {a.assignment_status}
                        </Badge>
                      </td>
                      <td>{userNames[a.assigned_by] || a.assigned_by.slice(0, 8)}</td>
                      <td>{new Date(a.created_at).toLocaleDateString()}</td>
                      <td className="text-truncate" style={{ maxWidth: '200px' }}>{a.reason}</td>
                      {canWrite && (
                        <td>
                          {a.assignment_status === 'assigned' && (
                            <>
                              <Button
                                variant="soft-success"
                                size="sm"
                                className="me-1"
                                onClick={() => handleAction(a, 'complete')}
                              >
                                Complete
                              </Button>
                              <Button
                                variant="soft-danger"
                                size="sm"
                                onClick={() => handleAction(a, 'revoke')}
                              >
                                Revoke
                              </Button>
                            </>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <AssignmentFormModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSuccess={loadAssignments}
        assignWorker={assignWorker}
      />

      <RevokeModal
        isOpen={showActionModal}
        onClose={() => { setShowActionModal(false); setSelectedAssignment(null) }}
        onSuccess={loadAssignments}
        assignment={selectedAssignment}
        action={actionType}
        revokeAssignment={revokeAssignment}
        completeAssignment={completeAssignment}
      />
    </>
  )
}

export default CaseAssignmentsPage

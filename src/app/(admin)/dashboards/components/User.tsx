import avatar2 from '@/assets/images/users/avatar-2.jpg'
import { Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useRecentCases, useRecentRegistrations } from '../hooks/useDashboardData'

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

const getStatusBadge = (status: string) => {
  const s = status.toLowerCase()
  if (s === 'approved' || s === 'allocated') return 'badge-soft-success'
  if (s === 'rejected' || s === 'cancelled') return 'badge-soft-danger'
  if (s === 'received' || s === 'pending') return 'badge-soft-warning'
  return 'badge-soft-primary'
}

const User = () => {
  const { data: recentCases, loading: loadingCases } = useRecentCases()
  const { data: recentRegistrations, loading: loadingRegistrations } = useRecentRegistrations()

  return (
    <>
      <Row>
        <Col xl={6}>
          <Card>
            <CardHeader className=" d-flex justify-content-between align-items-center">
              <h4 className="card-title mb-0">Recent Subsidy Cases</h4>
              <Link to="/bouwsubsidie/cases" className="btn btn-sm btn-light">
                View All
              </Link>
            </CardHeader>

            <CardBody className="pb-1">
              <div className="table-responsive">
                <table className="table table-hover mb-0 table-centered">
                  <thead>
                    <tr>
                      <th className="py-1">Case #</th>
                      <th className="py-1">Date</th>
                      <th className="py-1">Applicant</th>
                      <th className="py-1">Status</th>
                      <th className="py-1">District</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingCases ? (
                      <tr>
                        <td colSpan={5} className="text-center text-muted">Loading...</td>
                      </tr>
                    ) : recentCases.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-muted">No recent cases</td>
                      </tr>
                    ) : (
                      recentCases.map((caseItem) => (
                        <tr key={caseItem.id}>
                          <td>{caseItem.case_number}</td>
                          <td>{formatDate(caseItem.created_at)}</td>
                          <td>
                            <img src={avatar2} alt="avatar" className="img-fluid avatar-xs rounded-circle" />
                            <span className="align-middle ms-1">
                              {caseItem.person?.first_name} {caseItem.person?.last_name}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadge(caseItem.status)}`}>
                              {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                            </span>
                          </td>
                          <td>{caseItem.district_code}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xl={6}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <h4 className="card-title mb-0">Recent Housing Registrations</h4>
              <Link to="/woning/registrations" className="btn btn-sm btn-light">
                View All
              </Link>
            </CardHeader>
            <CardBody>
              <div className="table-responsive">
                <table className="table table-hover mb-0 table-centered">
                  <thead>
                    <tr>
                      <th className="py-1">Ref #</th>
                      <th className="py-1">Date</th>
                      <th className="py-1">Applicant</th>
                      <th className="py-1">Status</th>
                      <th className="py-1">District</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingRegistrations ? (
                      <tr>
                        <td colSpan={5} className="text-center text-muted">Loading...</td>
                      </tr>
                    ) : recentRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-muted">No recent registrations</td>
                      </tr>
                    ) : (
                      recentRegistrations.map((reg) => (
                        <tr key={reg.id}>
                          <td>{reg.reference_number}</td>
                          <td>{formatDate(reg.created_at)}</td>
                          <td>
                            <img src={avatar2} alt="avatar" className="img-fluid avatar-xs rounded-circle" />
                            <span className="align-middle ms-1">
                              {reg.person?.first_name} {reg.person?.last_name}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadge(reg.current_status)}`}>
                              {reg.current_status.charAt(0).toUpperCase() + reg.current_status.slice(1)}
                            </span>
                          </td>
                          <td>{reg.district_code}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default User

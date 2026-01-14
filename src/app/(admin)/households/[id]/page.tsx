import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Button, Spinner, Badge, Table } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { supabase } from '@/integrations/supabase/client'
import { notify } from '@/utils/notify'

interface Household {
  id: string
  primary_person_id: string
  household_size: number
  district_code: string
  created_at: string
  updated_at: string
  person?: {
    first_name: string
    last_name: string
    national_id: string
  }
}

interface HouseholdMember {
  id: string
  person_id: string
  relationship: string
  person?: {
    first_name: string
    last_name: string
    national_id: string
  }
}

interface Address {
  id: string
  address_line_1: string
  address_line_2: string | null
  district_code: string
  is_current: boolean
}

const HouseholdDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [household, setHousehold] = useState<Household | null>(null)
  const [members, setMembers] = useState<HouseholdMember[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHousehold = async () => {
    if (!id) return

    setLoading(true)
    const { data, error } = await supabase
      .from('household')
      .select(`
        *,
        person:primary_person_id (first_name, last_name, national_id)
      `)
      .eq('id', id)
      .single()

    if (error) {
      notify.error('Household not found')
      navigate('/households')
      return
    }

    setHousehold(data)

    // Fetch members
    const { data: memberData } = await supabase
      .from('household_member')
      .select(`
        *,
        person:person_id (first_name, last_name, national_id)
      `)
      .eq('household_id', id)

    setMembers(memberData || [])

    // Fetch addresses
    const { data: addressData } = await supabase
      .from('address')
      .select('*')
      .eq('household_id', id)

    setAddresses(addressData || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchHousehold()
  }, [id])

  if (loading) {
    return (
      <>
        <PageTitle subName="Shared Core" title="Household Detail" />
        <Card>
          <CardBody className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </CardBody>
        </Card>
      </>
    )
  }

  if (!household) {
    return (
      <>
        <PageTitle subName="Shared Core" title="Household Detail" />
        <Card>
          <CardBody className="text-center py-5">
            <p className="text-muted">Household not found</p>
            <Button variant="primary" onClick={() => navigate('/households')}>
              Back to Households
            </Button>
          </CardBody>
        </Card>
      </>
    )
  }

  return (
    <>
      <PageTitle subName="Shared Core" title="Household Detail" />

      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle as="h5">Household Information</CardTitle>
              <Button variant="outline-secondary" size="sm" onClick={() => navigate('/households')}>
                <IconifyIcon icon="mingcute:arrow-left-line" className="me-1" />
                Back
              </Button>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md={6} className="mb-3">
                  <label className="form-label text-muted small">Primary Person</label>
                  <p className="mb-0 fw-medium">
                    {household.person ? `${household.person.first_name} ${household.person.last_name}` : '-'}
                  </p>
                </Col>
                <Col md={6} className="mb-3">
                  <label className="form-label text-muted small">National ID</label>
                  <p className="mb-0 fw-medium">{household.person?.national_id || '-'}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <label className="form-label text-muted small">Household Size</label>
                  <p className="mb-0 fw-medium">{household.household_size}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <label className="form-label text-muted small">District Code</label>
                  <p className="mb-0 fw-medium">{household.district_code}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <label className="form-label text-muted small">Created</label>
                  <p className="mb-0 fw-medium">{new Date(household.created_at).toLocaleString()}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <label className="form-label text-muted small">Last Updated</label>
                  <p className="mb-0 fw-medium">{new Date(household.updated_at).toLocaleString()}</p>
                </Col>
              </Row>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h5">Household Members</CardTitle>
            </CardHeader>
            <CardBody>
              {members.length === 0 ? (
                <p className="text-muted text-center py-3">No additional members</p>
              ) : (
                <Table responsive hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>National ID</th>
                      <th>Relationship</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.id}>
                        <td>
                          {member.person ? `${member.person.first_name} ${member.person.last_name}` : '-'}
                        </td>
                        <td>{member.person?.national_id || '-'}</td>
                        <td>{member.relationship}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <CardHeader>
              <CardTitle as="h5">Addresses</CardTitle>
            </CardHeader>
            <CardBody>
              {addresses.length === 0 ? (
                <p className="text-muted text-center py-3">No addresses</p>
              ) : (
                <ul className="list-unstyled mb-0">
                  {addresses.map((addr) => (
                    <li key={addr.id} className="mb-3 pb-3 border-bottom">
                      <div className="d-flex align-items-start gap-2">
                        <IconifyIcon icon="mingcute:location-line" className="mt-1" />
                        <div>
                          <p className="mb-1">{addr.address_line_1}</p>
                          {addr.address_line_2 && <p className="mb-1 text-muted small">{addr.address_line_2}</p>}
                          <p className="mb-0 text-muted small">District: {addr.district_code}</p>
                          {addr.is_current && <Badge bg="success" className="mt-1">Current</Badge>}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default HouseholdDetail

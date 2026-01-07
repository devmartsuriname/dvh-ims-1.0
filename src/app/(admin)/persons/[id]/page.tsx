import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Button, Spinner, Badge } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import PersonFormModal from '../components/PersonFormModal'
import useToggle from '@/hooks/useToggle'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'react-toastify'

interface Person {
  id: string
  national_id: string
  first_name: string
  last_name: string
  date_of_birth: string | null
  gender: string | null
  nationality: string | null
  created_at: string
  updated_at: string
}

interface ContactPoint {
  id: string
  contact_type: string
  contact_value: string
  is_primary: boolean
}

const PersonDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [person, setPerson] = useState<Person | null>(null)
  const [contacts, setContacts] = useState<ContactPoint[]>([])
  const [loading, setLoading] = useState(true)
  const { isTrue: isOpen, toggle } = useToggle()

  const fetchPerson = async () => {
    if (!id) return

    setLoading(true)
    const { data, error } = await supabase
      .from('person')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      toast.error('Person not found')
      navigate('/persons')
      return
    }

    setPerson(data)

    // Fetch contact points
    const { data: contactData } = await supabase
      .from('contact_point')
      .select('*')
      .eq('person_id', id)

    setContacts(contactData || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchPerson()
  }, [id])

  const handleSuccess = () => {
    fetchPerson()
  }

  if (loading) {
    return (
      <>
        <PageTitle subName="Shared Core" title="Person Detail" />
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

  if (!person) {
    return (
      <>
        <PageTitle subName="Shared Core" title="Person Detail" />
        <Card>
          <CardBody className="text-center py-5">
            <p className="text-muted">Person not found</p>
            <Button variant="primary" onClick={() => navigate('/persons')}>
              Back to Persons
            </Button>
          </CardBody>
        </Card>
      </>
    )
  }

  return (
    <>
      <PageTitle subName="Shared Core" title="Person Detail" />

      <Row>
        <Col lg={8}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle as="h5">
                {person.first_name} {person.last_name}
              </CardTitle>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" size="sm" onClick={() => navigate('/persons')}>
                  <IconifyIcon icon="mingcute:arrow-left-line" className="me-1" />
                  Back
                </Button>
                <Button variant="primary" size="sm" onClick={toggle}>
                  <IconifyIcon icon="mingcute:edit-line" className="me-1" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md={6} className="mb-3">
                  <label className="form-label text-muted small">National ID</label>
                  <p className="mb-0 fw-medium">{person.national_id}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <label className="form-label text-muted small">Date of Birth</label>
                  <p className="mb-0 fw-medium">{person.date_of_birth || '-'}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <label className="form-label text-muted small">Gender</label>
                  <p className="mb-0 fw-medium">{person.gender || '-'}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <label className="form-label text-muted small">Nationality</label>
                  <p className="mb-0 fw-medium">{person.nationality || '-'}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <label className="form-label text-muted small">Created</label>
                  <p className="mb-0 fw-medium">{new Date(person.created_at).toLocaleString()}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <label className="form-label text-muted small">Last Updated</label>
                  <p className="mb-0 fw-medium">{new Date(person.updated_at).toLocaleString()}</p>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <CardHeader>
              <CardTitle as="h5">Contact Points</CardTitle>
            </CardHeader>
            <CardBody>
              {contacts.length === 0 ? (
                <p className="text-muted text-center py-3">No contact points</p>
              ) : (
                <ul className="list-unstyled mb-0">
                  {contacts.map((contact) => (
                    <li key={contact.id} className="d-flex align-items-center gap-2 mb-2">
                      <IconifyIcon
                        icon={
                          contact.contact_type === 'email'
                            ? 'mingcute:mail-line'
                            : contact.contact_type === 'phone'
                              ? 'mingcute:phone-line'
                              : 'mingcute:document-line'
                        }
                      />
                      <span>{contact.contact_value}</span>
                      {contact.is_primary && <Badge bg="primary">Primary</Badge>}
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <PersonFormModal isOpen={isOpen} onClose={toggle} onSuccess={handleSuccess} person={person} />
    </>
  )
}

export default PersonDetail

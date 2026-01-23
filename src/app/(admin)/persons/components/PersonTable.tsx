import { useEffect, useState, useCallback } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Button, Spinner } from 'react-bootstrap'
import { Grid } from 'gridjs-react'
import { html } from 'gridjs'
import { useNavigate } from 'react-router-dom'
import useToggle from '@/hooks/useToggle'
import PersonFormModal from './PersonFormModal'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { supabase } from '@/integrations/supabase/client'
import { notify } from '@/utils/notify'

interface Person {
  id: string
  national_id: string
  first_name: string
  last_name: string
  date_of_birth: string | null
  gender: string | null
  nationality: string | null
  created_at: string
}

const PersonTable = () => {
  const [persons, setPersons] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPerson, setSelectedPerson] = useState<Person | undefined>()
  const { isTrue: isOpen, toggle } = useToggle()
  const navigate = useNavigate()

  const fetchPersons = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('person')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching persons:', error)
      notify.error('Failed to load persons')
    } else {
      setPersons(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPersons()
  }, [fetchPersons])

  const handleAdd = () => {
    setSelectedPerson(undefined)
    toggle()
  }

  const handleEdit = (person: Person) => {
    setSelectedPerson(person)
    toggle()
  }

  const handleView = (id: string) => {
    navigate(`/persons/${id}`)
  }

  const handleSuccess = () => {
    fetchPersons()
  }

  if (loading) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </CardBody>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <CardTitle as="h5">Persons</CardTitle>
          <Button variant="primary" size="sm" onClick={handleAdd}>
            <IconifyIcon icon="mingcute:add-line" className="me-1" />
            Add Person
          </Button>
        </CardHeader>
        <CardBody>
          {persons.length === 0 ? (
            <p className="text-muted text-center py-4">No persons found. Click "Add Person" to create one.</p>
          ) : (
            <Grid
              data={persons.map((p) => [
                p.national_id,
                `${p.first_name} ${p.last_name}`,
                p.date_of_birth || '-',
                p.gender || '-',
                p.nationality || '-',
                p.id,
              ])}
              columns={[
                { name: 'National ID' },
                { name: 'Full Name' },
                { name: 'Date of Birth' },
                { name: 'Gender' },
                { name: 'Nationality' },
                { 
                  name: 'Actions', 
                  sort: false,
                  formatter: (cell: string) => html(`
                    <button class="btn btn-outline-primary btn-sm me-1" onclick="window.location.href='/persons/${cell}'">
                      View
                    </button>
                  `)
                },
              ]}
              search
              pagination={{ limit: 10 }}
              sort
              className={{ table: 'table table-hover mb-0' }}
            />
          )}
        </CardBody>
      </Card>

      <PersonFormModal
        isOpen={isOpen}
        onClose={toggle}
        onSuccess={handleSuccess}
        person={selectedPerson}
      />
    </>
  )
}

export default PersonTable

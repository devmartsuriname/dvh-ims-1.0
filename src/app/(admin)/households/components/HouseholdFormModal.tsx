import { useEffect, useState } from 'react'
import { Modal, Button, Row, Col, Form } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import TextFormInput from '@/components/from/TextFormInput'
import { supabase } from '@/integrations/supabase/client'
import { logAuditEvent } from '@/hooks/useAuditLog'
import { notify } from '@/utils/notify'

interface Person {
  id: string
  first_name: string
  last_name: string
}

interface HouseholdFormData {
  primary_person_id: string
  household_size: number
  district_code: string
}

interface HouseholdFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const schema = yup.object({
  primary_person_id: yup.string().required('Primary person is required'),
  household_size: yup.number().min(1, 'Household size must be at least 1').required('Household size is required'),
  district_code: yup.string().required('District code is required'),
})

const HouseholdFormModal = ({ isOpen, onClose, onSuccess }: HouseholdFormModalProps) => {
  const [persons, setPersons] = useState<Person[]>([])
  const [loadingPersons, setLoadingPersons] = useState(false)

  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<HouseholdFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      primary_person_id: '',
      household_size: 1,
      district_code: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      fetchPersons()
    }
  }, [isOpen])

  const fetchPersons = async () => {
    setLoadingPersons(true)
    const { data, error } = await supabase
      .from('person')
      .select('id, first_name, last_name')
      .order('last_name')

    if (!error) {
      setPersons(data || [])
    }
    setLoadingPersons(false)
  }

  const onSubmit = async (data: HouseholdFormData) => {
    try {
      const { data: newHousehold, error } = await supabase
        .from('household')
        .insert({
          primary_person_id: data.primary_person_id,
          household_size: data.household_size,
          district_code: data.district_code,
        })
        .select()
        .single()

      if (error) throw error

      await logAuditEvent({
        entityType: 'household',
        entityId: newHousehold.id,
        action: 'create',
      })

      notify.success('Household created successfully')
      reset()
      onSuccess()
      onClose()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred'
      notify.error(message)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal show={isOpen} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Household</Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Primary Person</Form.Label>
                <Controller
                  name="primary_person_id"
                  control={control}
                  render={({ field, fieldState }) => (
                    <>
                      <Form.Select {...field} isInvalid={!!fieldState.error} disabled={loadingPersons}>
                        <option value="">Select a person...</option>
                        {persons.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.first_name} {p.last_name}
                          </option>
                        ))}
                      </Form.Select>
                      {fieldState.error && (
                        <div className="invalid-feedback d-block">
                          {fieldState.error.message}
                        </div>
                      )}
                    </>
                  )}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <TextFormInput
                name="household_size"
                label="Household Size"
                type="number"
                control={control}
                containerClassName="mb-3"
                min={1}
              />
            </Col>
            <Col md={6}>
              <TextFormInput
                name="district_code"
                label="District Code"
                control={control}
                containerClassName="mb-3"
                placeholder="Enter district code"
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default HouseholdFormModal

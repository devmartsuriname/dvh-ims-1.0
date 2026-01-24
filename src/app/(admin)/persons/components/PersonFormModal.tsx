import { Modal, Button, Row, Col } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import TextFormInput from '@/components/from/TextFormInput'
import { supabase } from '@/integrations/supabase/client'
import { logAuditEvent } from '@/hooks/useAuditLog'
import { notify } from '@/utils/notify'

interface PersonFormData {
  national_id: string
  first_name: string
  last_name: string
  date_of_birth?: string
  gender?: string
  nationality?: string
}

interface PersonFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  person?: {
    id: string
    national_id: string
    first_name: string
    last_name: string
    date_of_birth?: string | null
    gender?: string | null
    nationality?: string | null
  }
}

const schema = yup.object({
  national_id: yup.string().required('National ID is required'),
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  date_of_birth: yup.string().optional(),
  gender: yup.string().optional(),
  nationality: yup.string().optional(),
})

const PersonFormModal = ({ isOpen, onClose, onSuccess, person }: PersonFormModalProps) => {
  const isEdit = !!person

  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<PersonFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      national_id: person?.national_id ?? '',
      first_name: person?.first_name ?? '',
      last_name: person?.last_name ?? '',
      date_of_birth: person?.date_of_birth ?? '',
      gender: person?.gender ?? '',
      nationality: person?.nationality ?? '',
    },
  })

  const onSubmit = async (data: PersonFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (isEdit && person) {
        const { error } = await supabase
          .from('person')
          .update({
            national_id: data.national_id,
            first_name: data.first_name,
            last_name: data.last_name,
            date_of_birth: data.date_of_birth || null,
            gender: data.gender || null,
            nationality: data.nationality || null,
          })
          .eq('id', person.id)

        if (error) throw error

        await logAuditEvent({
          entityType: 'person',
          entityId: person.id,
          action: 'update',
          metadata: { changed_fields: Object.keys(data) } as unknown as import('@/integrations/supabase/types').Json,
        })

        notify.success('Person updated successfully')
      } else {
        const { data: newPerson, error } = await supabase
          .from('person')
          .insert({
            national_id: data.national_id,
            first_name: data.first_name,
            last_name: data.last_name,
            date_of_birth: data.date_of_birth || null,
            gender: data.gender || null,
            nationality: data.nationality || null,
            created_by: user?.id,
          })
          .select()
          .single()

        if (error) throw error

        await logAuditEvent({
          entityType: 'person',
          entityId: newPerson.id,
          action: 'create',
        })

        notify.success('Person created successfully')
      }

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
    <Modal show={isOpen} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? 'Edit Person' : 'Add Person'}</Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <TextFormInput
                name="national_id"
                label="National ID"
                control={control}
                containerClassName="mb-3"
                placeholder="Enter national ID"
              />
            </Col>
            <Col md={6}>
              <TextFormInput
                name="first_name"
                label="First Name"
                control={control}
                containerClassName="mb-3"
                placeholder="Enter first name"
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <TextFormInput
                name="last_name"
                label="Last Name"
                control={control}
                containerClassName="mb-3"
                placeholder="Enter last name"
              />
            </Col>
            <Col md={6}>
              <TextFormInput
                name="date_of_birth"
                label="Date of Birth"
                type="date"
                control={control}
                containerClassName="mb-3"
              />
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <TextFormInput
                name="gender"
                label="Gender"
                control={control}
                containerClassName="mb-3"
                placeholder="Enter gender"
              />
            </Col>
            <Col md={6}>
              <TextFormInput
                name="nationality"
                label="Nationality"
                control={control}
                containerClassName="mb-3"
                placeholder="Enter nationality"
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default PersonFormModal

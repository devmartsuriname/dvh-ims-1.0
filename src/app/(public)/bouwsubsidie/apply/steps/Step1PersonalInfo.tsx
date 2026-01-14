import { Card, Row, Col, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import WizardStep from '@/components/public/WizardStep'
import TextFormInput from '@/components/from/TextFormInput'
import { GENDER_OPTIONS } from '../constants'
import type { WizardStepProps } from '../types'

const schema = yup.object({
  national_id: yup
    .string()
    .required('National ID is required')
    .min(5, 'National ID must be at least 5 characters'),
  first_name: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  last_name: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  date_of_birth: yup
    .string()
    .required('Date of birth is required'),
  gender: yup
    .string()
    .required('Gender is required'),
})

type FormData = yup.InferType<typeof schema>

/**
 * Step 1: Personal Identification
 * 
 * Collects National ID, first name, last name, date of birth, and gender.
 * All fields required to match Edge Function contract.
 */
const Step1PersonalInfo = ({ formData, updateFormData, onNext, onBack }: WizardStepProps) => {
  const { control, register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      national_id: formData.national_id,
      first_name: formData.first_name,
      last_name: formData.last_name,
      date_of_birth: formData.date_of_birth,
      gender: formData.gender,
    },
  })

  const onSubmit = (data: FormData) => {
    updateFormData(data)
    onNext()
  }

  return (
    <WizardStep
      title="Personal Identification"
      description="Please provide your personal details as they appear on your National ID."
      onBack={onBack}
      onNext={handleSubmit(onSubmit)}
    >
      <Card className="border-0 shadow-none">
        <Card.Body className="p-0">
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <TextFormInput
                  name="national_id"
                  label="National ID Number"
                  placeholder="Enter your National ID"
                  control={control}
                  containerClassName="mb-0"
                />
                {errors.national_id?.message && (
                  <div className="text-danger small mt-1">{String(errors.national_id.message)}</div>
                )}
              </Col>
              
              <Col md={6}>
                <TextFormInput
                  name="first_name"
                  label="First Name"
                  placeholder="Enter your first name"
                  control={control}
                  containerClassName="mb-0"
                />
                {errors.first_name?.message && (
                  <div className="text-danger small mt-1">{String(errors.first_name.message)}</div>
                )}
              </Col>
              
              <Col md={6}>
                <TextFormInput
                  name="last_name"
                  label="Last Name"
                  placeholder="Enter your last name"
                  control={control}
                  containerClassName="mb-0"
                />
                {errors.last_name?.message && (
                  <div className="text-danger small mt-1">{String(errors.last_name.message)}</div>
                )}
              </Col>
              
              <Col md={6}>
                <TextFormInput
                  name="date_of_birth"
                  label="Date of Birth"
                  type="date"
                  control={control}
                  containerClassName="mb-0"
                />
                {errors.date_of_birth?.message && (
                  <div className="text-danger small mt-1">{String(errors.date_of_birth.message)}</div>
                )}
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Gender <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    {...register('gender')}
                    isInvalid={!!errors.gender}
                  >
                    <option value="">Select gender</option>
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.gender?.message && (
                    <div className="text-danger small mt-1">{String(errors.gender.message)}</div>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </WizardStep>
  )
}

export default Step1PersonalInfo

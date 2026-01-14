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
  full_name: yup
    .string()
    .required('Full name is required')
    .min(2, 'Full name must be at least 2 characters'),
  date_of_birth: yup.string(),
  gender: yup.string(),
})

type FormData = yup.InferType<typeof schema>

/**
 * Step 1: Personal Identification
 * 
 * Collects National ID, full name, date of birth, and gender.
 */
const Step1PersonalInfo = ({ formData, updateFormData, onNext, onBack }: WizardStepProps) => {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      national_id: formData.national_id,
      full_name: formData.full_name,
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
                  name="full_name"
                  label="Full Name"
                  placeholder="Enter your full name"
                  control={control}
                  containerClassName="mb-0"
                />
                {errors.full_name?.message && (
                  <div className="text-danger small mt-1">{String(errors.full_name.message)}</div>
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
                <div className="text-muted small mt-1">Optional</div>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    defaultValue={formData.gender}
                    onChange={(e) => updateFormData({ gender: e.target.value })}
                  >
                    <option value="">Select gender (optional)</option>
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
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

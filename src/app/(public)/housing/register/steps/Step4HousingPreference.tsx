import { Card, Row, Col, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import WizardStep from '@/components/public/WizardStep'
import { DISTRICTS } from '@/constants/districts'
import { INTEREST_TYPES } from '../constants'
import type { WizardStepProps } from '../types'

const schema = yup.object({
  interest_type: yup
    .string()
    .required('Please select your interest type'),
  preferred_district: yup
    .string()
    .required('Please select your preferred district'),
})

type FormData = yup.InferType<typeof schema>

/**
 * Step 4: Housing Preference
 * 
 * Collects interest type (rent/rent-to-own/purchase) and preferred district.
 */
const Step4HousingPreference = ({ formData, updateFormData, onNext, onBack }: WizardStepProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      interest_type: formData.interest_type,
      preferred_district: formData.preferred_district,
    },
  })

  const onSubmit = (data: FormData) => {
    updateFormData(data)
    onNext()
  }

  return (
    <WizardStep
      title="Housing Preference"
      description="What type of housing are you interested in?"
      onBack={onBack}
      onNext={handleSubmit(onSubmit)}
    >
      <Card className="border-0 shadow-none">
        <Card.Body className="p-0">
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Interest Type</Form.Label>
                  <Form.Select
                    {...register('interest_type')}
                    isInvalid={!!errors.interest_type}
                  >
                    <option value="">Select interest type</option>
                    {INTEREST_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.interest_type?.message && (
                    <div className="text-danger small mt-1">{String(errors.interest_type.message)}</div>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Preferred District</Form.Label>
                  <Form.Select
                    {...register('preferred_district')}
                    isInvalid={!!errors.preferred_district}
                  >
                    <option value="">Select preferred district</option>
                    {DISTRICTS.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.preferred_district?.message && (
                    <div className="text-danger small mt-1">{String(errors.preferred_district.message)}</div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <div className="bg-light rounded p-3 mt-4">
              <p className="text-muted small mb-0">
                <strong>Note:</strong> Your preferred district is used for allocation 
                prioritization. Final allocation may be in a different district based on availability.
              </p>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </WizardStep>
  )
}

export default Step4HousingPreference

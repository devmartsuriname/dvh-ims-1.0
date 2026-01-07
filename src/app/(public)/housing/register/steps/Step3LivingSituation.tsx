import { Card, Row, Col, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import WizardStep from '@/components/public/WizardStep'
import TextFormInput from '@/components/from/TextFormInput'
import { DISTRICTS } from '@/constants/districts'
import { HOUSING_TYPES } from '../constants'
import type { WizardStepProps } from '../types'

const schema = yup.object({
  current_address: yup
    .string()
    .required('Current address is required')
    .min(5, 'Address must be at least 5 characters'),
  current_district: yup
    .string()
    .required('District is required'),
  current_housing_type: yup
    .string()
    .required('Housing type is required'),
  monthly_rent: yup.string(),
  number_of_residents: yup
    .number()
    .min(1, 'Must be at least 1')
    .required('Number of residents is required'),
})

type FormData = yup.InferType<typeof schema>

/**
 * Step 3: Current Living Situation
 * 
 * Collects current address, district, housing type, rent, and residents.
 */
const Step3LivingSituation = ({ formData, updateFormData, onNext, onBack }: WizardStepProps) => {
  const { control, register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      current_address: formData.current_address,
      current_district: formData.current_district,
      current_housing_type: formData.current_housing_type,
      monthly_rent: formData.monthly_rent,
      number_of_residents: formData.number_of_residents,
    },
  })

  const onSubmit = (data: FormData) => {
    updateFormData(data)
    onNext()
  }

  return (
    <WizardStep
      title="Current Living Situation"
      description="Tell us about where you currently live."
      onBack={onBack}
      onNext={handleSubmit(onSubmit)}
    >
      <Card className="border-0 shadow-none">
        <Card.Body className="p-0">
          <Form>
            <Row className="g-3">
              <Col xs={12}>
                <TextFormInput
                  name="current_address"
                  label="Current Address"
                  placeholder="Enter your current address"
                  control={control}
                  containerClassName="mb-0"
                />
                {errors.current_address?.message && (
                  <div className="text-danger small mt-1">{String(errors.current_address.message)}</div>
                )}
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>District</Form.Label>
                  <Form.Select
                    {...register('current_district')}
                    isInvalid={!!errors.current_district}
                  >
                    <option value="">Select your district</option>
                    {DISTRICTS.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.current_district?.message && (
                    <div className="text-danger small mt-1">{String(errors.current_district.message)}</div>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Housing Type</Form.Label>
                  <Form.Select
                    {...register('current_housing_type')}
                    isInvalid={!!errors.current_housing_type}
                  >
                    <option value="">Select housing type</option>
                    {HOUSING_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.current_housing_type?.message && (
                    <div className="text-danger small mt-1">{String(errors.current_housing_type.message)}</div>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <TextFormInput
                  name="monthly_rent"
                  label="Monthly Rent (SRD)"
                  placeholder="Enter amount"
                  control={control}
                  containerClassName="mb-0"
                />
                <div className="text-muted small mt-1">Optional - if renting</div>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Number of Residents</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    {...register('number_of_residents', { valueAsNumber: true })}
                    isInvalid={!!errors.number_of_residents}
                  />
                  {errors.number_of_residents?.message && (
                    <div className="text-danger small mt-1">{String(errors.number_of_residents.message)}</div>
                  )}
                  <div className="text-muted small mt-1">Including yourself</div>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </WizardStep>
  )
}

export default Step3LivingSituation

import { Card, Row, Col, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import WizardStep from '@/components/public/WizardStep'
import TextFormInput from '@/components/from/TextFormInput'
import { DISTRICTS } from '@/constants/districts'
import type { WizardStepProps } from '../types'

const schema = yup.object({
  address_line_1: yup
    .string()
    .required('Address is required')
    .min(5, 'Address must be at least 5 characters'),
  district: yup
    .string()
    .required('District is required'),
  ressort: yup.string(),
})

type FormData = yup.InferType<typeof schema>

/**
 * Step 4: Current Address
 * 
 * Collects address line (required), district (required), and ressort (optional).
 * Field name aligned with Edge Function contract (address_line_1).
 */
const Step4Address = ({ formData, updateFormData, onNext, onBack }: WizardStepProps) => {
  const { control, register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      address_line_1: formData.address_line_1,
      district: formData.district,
      ressort: formData.ressort,
    },
  })

  const onSubmit = (data: FormData) => {
    updateFormData(data)
    onNext()
  }

  return (
    <WizardStep
      title="Current Address"
      description="Where do you currently reside?"
      onBack={onBack}
      onNext={handleSubmit(onSubmit)}
    >
      <Card className="border-0 shadow-none">
        <Card.Body className="p-0">
          <Form>
            <Row className="g-3">
              <Col xs={12}>
                <TextFormInput
                  name="address_line_1"
                  label="Street Address"
                  placeholder="Enter your street address"
                  control={control}
                  containerClassName="mb-0"
                />
                {errors.address_line_1?.message && (
                  <div className="text-danger small mt-1">{String(errors.address_line_1.message)}</div>
                )}
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label>District</Form.Label>
                  <Form.Select
                    {...register('district')}
                    isInvalid={!!errors.district}
                  >
                    <option value="">Select your district</option>
                    {DISTRICTS.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.district?.message && (
                    <div className="text-danger small mt-1">{String(errors.district.message)}</div>
                  )}
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <TextFormInput
                  name="ressort"
                  label="Ressort"
                  placeholder="Enter your ressort"
                  control={control}
                  containerClassName="mb-0"
                />
                <div className="text-muted small mt-1">Optional</div>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </WizardStep>
  )
}

export default Step4Address

import { Card, Row, Col, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import WizardStep from '@/components/public/WizardStep'
import TextFormInput from '@/components/from/TextFormInput'
import type { WizardStepProps } from '../types'

/**
 * Validation schema aligned with Edge Function contract
 * Email is now REQUIRED per submit-bouwsubsidie-application
 */
const schema = yup.object({
  phone_number: yup
    .string()
    .required('Phone number is required')
    .min(7, 'Phone number must be at least 7 digits'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
})

type FormData = yup.InferType<typeof schema>

/**
 * Step 2: Contact Information
 * 
 * Collects phone number and email (both required).
 * 
 * UPDATED: Admin v1.1-D - Made email required per Edge Function contract
 */
const Step2ContactInfo = ({ formData, updateFormData, onNext, onBack }: WizardStepProps) => {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      phone_number: formData.phone_number,
      email: formData.email,
    },
  })

  const onSubmit = (data: FormData) => {
    updateFormData(data)
    onNext()
  }

  return (
    <WizardStep
      title="Contact Information"
      description="How can we reach you regarding your application?"
      onBack={onBack}
      onNext={handleSubmit(onSubmit)}
    >
      <Card className="border-0 shadow-none">
        <Card.Body className="p-0">
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <TextFormInput
                  name="phone_number"
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  control={control}
                  containerClassName="mb-0"
                />
                {errors.phone_number?.message && (
                  <div className="text-danger small mt-1">{String(errors.phone_number.message)}</div>
                )}
              </Col>
              
              <Col md={6}>
                <TextFormInput
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email address"
                  control={control}
                  containerClassName="mb-0"
                />
                {errors.email?.message && (
                  <div className="text-danger small mt-1">{String(errors.email.message)}</div>
                )}
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </WizardStep>
  )
}

export default Step2ContactInfo

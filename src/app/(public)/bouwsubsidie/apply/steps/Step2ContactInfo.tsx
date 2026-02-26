import { Row, Col, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useTranslation } from 'react-i18next'
import WizardStep from '@/components/public/WizardStep'
import TextFormInput from '@/components/from/TextFormInput'
import type { WizardStepProps } from '../types'

/**
 * Step 2: Contact Information
 * V1.3 Phase 5A — Localized with i18n
 * 
 * Collects phone number and email (both required).
 */
const Step2ContactInfo = ({ formData, updateFormData, onNext, onBack }: WizardStepProps) => {
  const { t } = useTranslation()

  const schema = yup.object({
    phone_number: yup
      .string()
      .required(t('validation.phoneRequired'))
      .min(7, t('validation.phoneMinLength')),
    email: yup
      .string()
      .required(t('validation.emailRequired'))
      .email(t('validation.invalidEmail')),
  })

  type FormData = yup.InferType<typeof schema>

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
      title={t('bouwsubsidie.step2.title')}
      description={t('bouwsubsidie.step2.description')}
      onBack={onBack}
      onNext={handleSubmit(onSubmit)}
    >
      <Form>
        <Row className="g-3">
              <Col md={6}>
                <TextFormInput
                  name="phone_number"
                  label={t('bouwsubsidie.step2.phoneNumber')}
                  placeholder={t('bouwsubsidie.step2.phoneNumberPlaceholder')}
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
                  label={t('bouwsubsidie.step2.email')}
                  type="email"
                  placeholder={t('bouwsubsidie.step2.emailPlaceholder')}
                  control={control}
                  containerClassName="mb-0"
                />
                {errors.email?.message && (
                  <div className="text-danger small mt-1">{String(errors.email.message)}</div>
                )}
              </Col>
        </Row>
      </Form>
    </WizardStep>
  )
}

export default Step2ContactInfo

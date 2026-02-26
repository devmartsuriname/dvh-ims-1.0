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
 * 
 * Collects phone number and email (email required per Edge Function contract).
 * i18n enabled - NL default
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

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      phone_number: formData.phone_number,
      email: formData.email,
    },
  })

  const onSubmit = (data: any) => {
    updateFormData(data)
    onNext()
  }

  return (
    <WizardStep
      title={t('housing.step2.title')}
      description={t('housing.step2.description')}
      onBack={onBack}
      onNext={handleSubmit(onSubmit)}
    >
      <Form>
        <Row className="g-3">
              <Col md={6}>
                <TextFormInput
                  name="phone_number"
                  label={t('housing.step2.phoneNumber')}
                  placeholder={t('housing.step2.phoneNumberPlaceholder')}
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
                  label={t('housing.step2.email')}
                  type="email"
                  placeholder={t('housing.step2.emailPlaceholder')}
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

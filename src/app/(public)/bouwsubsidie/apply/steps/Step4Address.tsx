import { Row, Col, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useTranslation } from 'react-i18next'
import WizardStep from '@/components/public/WizardStep'
import TextFormInput from '@/components/from/TextFormInput'
import { DISTRICTS } from '@/constants/districts'
import type { WizardStepProps } from '../types'

/**
 * Step 4: Current Address
 * V1.3 Phase 5A — Localized with i18n
 * 
 * Collects address line, district (required), and ressort (optional).
 */
const Step4Address = ({ formData, updateFormData, onNext, onBack }: WizardStepProps) => {
  const { t } = useTranslation()

  const schema = yup.object({
    address_line_1: yup
      .string()
      .required(t('validation.addressRequired'))
      .min(5, t('validation.addressMinLength')),
    district: yup
      .string()
      .required(t('validation.districtRequired')),
    ressort: yup.string(),
  })

  type FormData = yup.InferType<typeof schema>

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
      title={t('bouwsubsidie.step4.title')}
      description={t('bouwsubsidie.step4.description')}
      onBack={onBack}
      onNext={handleSubmit(onSubmit)}
    >
      <Form>
        <Row className="g-3">
              <Col xs={12}>
                <TextFormInput
                  name="address_line_1"
                  label={t('bouwsubsidie.step4.addressLine1')}
                  placeholder={t('bouwsubsidie.step4.addressLine1Placeholder')}
                  control={control}
                  containerClassName="mb-0"
                />
                {errors.address_line_1?.message && (
                  <div className="text-danger small mt-1">{String(errors.address_line_1.message)}</div>
                )}
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('bouwsubsidie.step4.district')} <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    {...register('district')}
                    isInvalid={!!errors.district}
                  >
                    <option value="">{t('bouwsubsidie.step4.districtPlaceholder')}</option>
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
                  label={t('bouwsubsidie.step4.ressort')}
                  placeholder={t('bouwsubsidie.step4.ressortPlaceholder')}
                  control={control}
                  containerClassName="mb-0"
                />
                <Form.Text className="text-muted">{t('common.optional')}</Form.Text>
              </Col>
        </Row>
      </Form>
    </WizardStep>
  )
}

export default Step4Address

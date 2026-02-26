import { Row, Col, Form } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useTranslation } from 'react-i18next'
import WizardStep from '@/components/public/WizardStep'
import TextFormInput from '@/components/from/TextFormInput'
import { GENDER_OPTIONS } from '../constants'
import type { WizardStepProps } from '../types'

/**
 * Step 1: Personal Identification
 * V1.3 Phase 5A — Localized with i18n
 * 
 * Collects National ID, first name, last name, date of birth, and gender.
 * All fields are required per Edge Function contract.
 */
const Step1PersonalInfo = ({ formData, updateFormData, onNext, onBack }: WizardStepProps) => {
  const { t } = useTranslation()

  // Validation schema with translated messages
  const schema = yup.object({
    national_id: yup
      .string()
      .required(t('validation.nationalIdRequired'))
      .min(5, t('validation.nationalIdMinLength')),
    first_name: yup
      .string()
      .required(t('validation.firstNameRequired'))
      .min(1, t('validation.firstNameRequired')),
    last_name: yup
      .string()
      .required(t('validation.lastNameRequired'))
      .min(1, t('validation.lastNameRequired')),
    date_of_birth: yup
      .string()
      .required(t('validation.dateOfBirthRequired')),
    gender: yup
      .string()
      .required(t('validation.genderRequired'))
      .oneOf(['male', 'female', 'other'], t('validation.genderInvalid')),
  })

  type FormData = yup.InferType<typeof schema>

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
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
      title={t('bouwsubsidie.step1.title')}
      description={t('bouwsubsidie.step1.description')}
      onBack={onBack}
      onNext={handleSubmit(onSubmit)}
    >
      <Form>
            <Row className="g-3">
              <Col md={6}>
                <TextFormInput
                  name="national_id"
                  label={t('bouwsubsidie.step1.nationalId')}
                  placeholder={t('bouwsubsidie.step1.nationalIdPlaceholder')}
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
                  label={t('bouwsubsidie.step1.firstName')}
                  placeholder={t('bouwsubsidie.step1.firstNamePlaceholder')}
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
                  label={t('bouwsubsidie.step1.lastName')}
                  placeholder={t('bouwsubsidie.step1.lastNamePlaceholder')}
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
                  label={t('bouwsubsidie.step1.dateOfBirth')}
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
                  <Form.Label>{t('bouwsubsidie.step1.gender')} <span className="text-danger">*</span></Form.Label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Form.Select
                        {...field}
                        isInvalid={!!errors.gender}
                      >
                        <option value="">{t('bouwsubsidie.step1.genderPlaceholder')}</option>
                        {GENDER_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {t(option.labelKey)}
                          </option>
                        ))}
                      </Form.Select>
                    )}
                  />
                  {errors.gender?.message && (
                    <div className="text-danger small mt-1">{String(errors.gender.message)}</div>
                  )}
                </Form.Group>
              </Col>
            </Row>
      </Form>
    </WizardStep>
  )
}

export default Step1PersonalInfo

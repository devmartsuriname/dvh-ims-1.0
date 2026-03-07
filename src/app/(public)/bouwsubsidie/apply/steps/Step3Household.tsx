import { Row, Col, Form, Button, Table } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import WizardStep from '@/components/public/WizardStep'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import type { WizardStepProps, ChildInput } from '../types'

/**
 * Step 3: Household Information
 * V1.8 Phase 5 — Added dynamic children table
 */
const Step3Household = ({ formData, updateFormData, onNext, onBack }: WizardStepProps) => {
  const { t } = useTranslation()
  const [children, setChildren] = useState<ChildInput[]>(formData.children || [])

  const schema = yup.object({
    household_size: yup
      .number()
      .required(t('validation.householdSizeRequired'))
      .min(1, t('validation.householdSizeMin'))
      .max(20, t('validation.householdSizeMax')),
    dependents: yup
      .number()
      .min(0, t('validation.minValue', { min: 0 }))
      .max(20, t('validation.maxValue', { max: 20 })),
  })

  type FormData = yup.InferType<typeof schema>

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      household_size: formData.household_size,
      dependents: formData.dependents,
    },
  })

  const addChild = () => {
    setChildren([...children, { age: 0, gender: 'M', has_disability: false }])
  }

  const removeChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index))
  }

  const updateChild = (index: number, field: keyof ChildInput, value: any) => {
    const updated = [...children]
    updated[index] = { ...updated[index], [field]: value }
    setChildren(updated)
  }

  const onSubmit = (data: FormData) => {
    updateFormData({ ...data, children })
    onNext()
  }

  return (
    <WizardStep
      title={t('bouwsubsidie.step3.title')}
      description={t('bouwsubsidie.step3.description')}
      onBack={onBack}
      onNext={handleSubmit(onSubmit)}
    >
      <Form>
        <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('bouwsubsidie.step3.householdSize')}</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    max={20}
                    placeholder={t('bouwsubsidie.step3.householdSizePlaceholder')}
                    {...register('household_size')}
                    isInvalid={!!errors.household_size}
                  />
                  {errors.household_size?.message && (
                    <div className="text-danger small mt-1">{String(errors.household_size.message)}</div>
                  )}
                  <Form.Text className="text-muted">
                    {t('bouwsubsidie.step3.householdSizeHelp')}
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{t('bouwsubsidie.step3.dependents')}</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    max={20}
                    placeholder={t('bouwsubsidie.step3.dependentsPlaceholder')}
                    {...register('dependents')}
                    isInvalid={!!errors.dependents}
                  />
                  {errors.dependents?.message && (
                    <div className="text-danger small mt-1">{String(errors.dependents.message)}</div>
                  )}
                  <Form.Text className="text-muted">
                    {t('bouwsubsidie.step3.dependentsHelp')}
                  </Form.Text>
                </Form.Group>
              </Col>
        </Row>

        {/* Children Section */}
        <div className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0 fw-semibold">{t('bouwsubsidie.step3.childrenTitle')}</h6>
            <Button variant="outline-primary" size="sm" onClick={addChild}>
              <IconifyIcon icon="mingcute:add-line" className="me-1" />
              {t('bouwsubsidie.step3.addChild')}
            </Button>
          </div>

          {children.length === 0 ? (
            <p className="text-muted small">{t('bouwsubsidie.step3.noChildren')}</p>
          ) : (
            <Table bordered size="sm" responsive>
              <thead className="bg-light">
                <tr>
                  <th>#</th>
                  <th>{t('bouwsubsidie.step3.childAge')}</th>
                  <th>{t('bouwsubsidie.step3.childGender')}</th>
                  <th>{t('bouwsubsidie.step3.childDisability')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {children.map((child, index) => (
                  <tr key={index}>
                    <td className="align-middle">{index + 1}</td>
                    <td>
                      <Form.Control
                        type="number"
                        min={0}
                        max={17}
                        size="sm"
                        value={child.age}
                        onChange={(e) => updateChild(index, 'age', parseInt(e.target.value) || 0)}
                      />
                    </td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={child.gender}
                        onChange={(e) => updateChild(index, 'gender', e.target.value as 'M' | 'F')}
                      >
                        <option value="M">{t('bouwsubsidie.gender.male')}</option>
                        <option value="F">{t('bouwsubsidie.gender.female')}</option>
                      </Form.Select>
                    </td>
                    <td className="text-center align-middle">
                      <Form.Check
                        type="checkbox"
                        checked={child.has_disability}
                        onChange={(e) => updateChild(index, 'has_disability', e.target.checked)}
                      />
                    </td>
                    <td className="text-center align-middle">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeChild(index)}
                      >
                        <IconifyIcon icon="mingcute:close-line" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </Form>
    </WizardStep>
  )
}

export default Step3Household

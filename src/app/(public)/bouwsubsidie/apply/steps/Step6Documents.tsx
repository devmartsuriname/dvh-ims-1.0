/**
 * Step 6: Document Upload
 * V1.8 Phase 2.1 — Updated summary panel with 3 status indicators
 * 
 * Uses DocumentUploadAccordion for compact mobile-friendly upload.
 * Upload logic unchanged from V1.3.
 */

import { useState } from 'react'
import { Card, Alert, Badge } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/integrations/supabase/client'
import WizardStep from '@/components/public/WizardStep'
import DocumentUploadAccordion from '@/components/public/DocumentUploadAccordion'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import type { WizardStepProps, DocumentUpload } from '../types'
import { BOUWSUBSIDIE_INCOME_GROUP } from '@/config/documentRequirements'

const MAX_FILE_SIZE = 10 * 1024 * 1024

const Step6Documents = ({ formData, updateFormData, onNext, onBack }: WizardStepProps) => {
  const { t } = useTranslation()
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({})

  // Mandatory check (ID_COPY, BANK_STATEMENT)
  const mandatoryDocs = formData.documents.filter(d => d.is_mandatory)
  const uploadedMandatoryCount = mandatoryDocs.filter(d => d.uploaded_file).length
  const allMandatoryUploaded = uploadedMandatoryCount === mandatoryDocs.length

  // Group-mandatory check: at least 1 income_proof document uploaded
  const incomeGroupDocs = formData.documents.filter(d => d.validation_group === BOUWSUBSIDIE_INCOME_GROUP)
  const uploadedIncomeCount = incomeGroupDocs.filter(d => d.uploaded_file).length
  const hasIncomeProof = uploadedIncomeCount > 0

  // Individual mandatory doc checks
  const idCopyUploaded = !!formData.documents.find(d => d.document_code === 'ID_COPY')?.uploaded_file
  const nationalityDeclarationUploaded = !!formData.documents.find(d => d.document_code === 'NATIONALITY_DECLARATION')?.uploaded_file

  // Combined gate
  const canProceed = allMandatoryUploaded && hasIncomeProof

  const totalUploaded = formData.documents.filter(d => d.uploaded_file).length

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('bouwsubsidie_session_id')
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      sessionStorage.setItem('bouwsubsidie_session_id', sessionId)
    }
    return sessionId
  }

  const handleUpload = async (docId: string, file: File) => {
    setUploadErrors(prev => ({ ...prev, [docId]: '' }))

    if (file.size > MAX_FILE_SIZE) {
      setUploadErrors(prev => ({ ...prev, [docId]: t('bouwsubsidie.step6.fileTooLarge') }))
      return
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!validTypes.includes(file.type)) {
      setUploadErrors(prev => ({ ...prev, [docId]: t('bouwsubsidie.step6.invalidType') }))
      return
    }

    setUploadingDocId(docId)
    setUploadProgress(0)

    try {
      const sessionId = getSessionId()
      const timestamp = Date.now()
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf'
      const filePath = `bouwsubsidie/${sessionId}/${docId}_${timestamp}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('citizen-uploads')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        console.error('[Step6Documents] Upload error:', uploadError)
        setUploadErrors(prev => ({ ...prev, [docId]: t('bouwsubsidie.step6.uploadError') }))
        return
      }

      const updatedDocuments = formData.documents.map(doc => {
        if (doc.id === docId) {
          return {
            ...doc,
            uploaded_file: {
              file_path: filePath,
              file_name: file.name,
              file_size: file.size,
              uploaded_at: new Date().toISOString(),
            },
          }
        }
        return doc
      })

      updateFormData({ documents: updatedDocuments })
      setUploadProgress(100)
    } catch (error) {
      console.error('[Step6Documents] Upload exception:', error)
      setUploadErrors(prev => ({ ...prev, [docId]: t('bouwsubsidie.step6.uploadError') }))
    } finally {
      setUploadingDocId(null)
      setUploadProgress(0)
    }
  }

  const handleRemove = async (docId: string) => {
    const doc = formData.documents.find(d => d.id === docId)
    if (!doc?.uploaded_file) return

    try {
      await supabase.storage.from('citizen-uploads').remove([doc.uploaded_file.file_path])
    } catch (error) {
      console.error('[Step6Documents] Remove error:', error)
    }

    const updatedDocuments = formData.documents.map(d => {
      if (d.id === docId) {
        const { uploaded_file, ...rest } = d
        return rest as DocumentUpload
      }
      return d
    })

    updateFormData({ documents: updatedDocuments })
  }

  return (
    <WizardStep
      title={t('bouwsubsidie.step6.title')}
      description={t('bouwsubsidie.step6.description')}
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!canProceed}
    >
      <Alert variant="info" className="d-flex align-items-start mb-3">
        <IconifyIcon icon="mingcute:information-line" className="text-info fs-4 me-2 mt-1 flex-shrink-0" />
        <div>
          <h6 className="fw-semibold mb-1">{t('bouwsubsidie.step6.infoTitle')}</h6>
          <p className="mb-0 small">{t('bouwsubsidie.step6.infoText')}</p>
        </div>
      </Alert>

      <DocumentUploadAccordion
        documents={formData.documents}
        onUpload={handleUpload}
        onRemove={handleRemove}
        uploadingDocId={uploadingDocId}
        uploadProgress={uploadProgress}
        uploadErrors={uploadErrors}
        ns="bouwsubsidie.step6"
      />

      {/* Ready-to-proceed checklist */}
      <Card className={`mt-3 ${canProceed ? 'border-success' : 'border-warning'}`}>
        <Card.Body className="py-3">
          <h6 className="fw-semibold mb-2 small">{t('bouwsubsidie.step6.checklistTitle')}</h6>
          <ul className="list-unstyled mb-2">
            <li className="d-flex align-items-center mb-2">
              <IconifyIcon
                icon={idCopyUploaded ? 'mingcute:check-circle-fill' : 'mingcute:close-circle-line'}
                className={`me-2 ${idCopyUploaded ? 'text-success' : 'text-warning'}`}
              />
              <span className="small">{t('bouwsubsidie.step6.checkIdCopy')}</span>
            </li>
            <li className="d-flex align-items-center mb-2">
              <IconifyIcon
                icon={nationalityDeclarationUploaded ? 'mingcute:check-circle-fill' : 'mingcute:close-circle-line'}
                className={`me-2 ${nationalityDeclarationUploaded ? 'text-success' : 'text-warning'}`}
              />
              <span className="small">{t('bouwsubsidie.step6.checkNationalityDeclaration')}</span>
            </li>
            <li className="d-flex align-items-center mb-2">
              <IconifyIcon
                icon={hasIncomeProof ? 'mingcute:check-circle-fill' : 'mingcute:close-circle-line'}
                className={`me-2 ${hasIncomeProof ? 'text-success' : 'text-warning'}`}
              />
              <span className="small">{t('bouwsubsidie.step6.checkIncomeProof')}</span>
            </li>
          </ul>

          {canProceed ? (
            <p className="text-success small mb-0">
              <IconifyIcon icon="mingcute:check-circle-fill" className="me-1" />
              {t('bouwsubsidie.step6.allRequiredUploaded')}
            </p>
          ) : (
            <p className="text-warning small mb-0">
              <IconifyIcon icon="mingcute:warning-line" className="me-1" />
              {!allMandatoryUploaded
                ? t('bouwsubsidie.step6.mandatoryMissing')
                : t('bouwsubsidie.step6.uploadIncomeToProced')}
            </p>
          )}

          {/* Total counter */}
          <div className="d-flex justify-content-between align-items-center border-top pt-2 mt-2">
            <span className="small text-muted">{t('bouwsubsidie.step6.documentsUploaded')}</span>
            <span className="small fw-medium">{totalUploaded} {t('bouwsubsidie.step6.of')} {formData.documents.length}</span>
          </div>
        </Card.Body>
      </Card>
    </WizardStep>
  )
}

export default Step6Documents

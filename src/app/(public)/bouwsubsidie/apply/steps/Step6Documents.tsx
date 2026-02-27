/**
 * Step 6: Document Upload
 * V1.7 Phase B — Tabs + Accordion compact layout
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

const MAX_FILE_SIZE = 10 * 1024 * 1024

const Step6Documents = ({ formData, updateFormData, onNext, onBack }: WizardStepProps) => {
  const { t } = useTranslation()
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({})

  const mandatoryDocs = formData.documents.filter(d => d.is_mandatory)
  const uploadedMandatoryCount = mandatoryDocs.filter(d => d.uploaded_file).length
  const allMandatoryUploaded = uploadedMandatoryCount === mandatoryDocs.length
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
      nextDisabled={!allMandatoryUploaded}
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

      {/* Summary */}
      <Card className={`mt-3 ${allMandatoryUploaded ? 'border-success' : 'border-warning'}`}>
        <Card.Body className="py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <span className="text-muted">{t('bouwsubsidie.step6.documentsUploaded')}:</span>
              <strong className="ms-2">{totalUploaded} {t('bouwsubsidie.step6.of')} {formData.documents.length}</strong>
            </div>
            <div>
              {allMandatoryUploaded ? (
                <Badge bg="success" className="d-flex align-items-center gap-1">
                  <IconifyIcon icon="mingcute:check-circle-fill" />
                  {t('bouwsubsidie.step6.mandatory')}: {uploadedMandatoryCount}/{mandatoryDocs.length}
                </Badge>
              ) : (
                <Badge bg="warning" className="text-dark d-flex align-items-center gap-1">
                  <IconifyIcon icon="mingcute:warning-line" />
                  {t('bouwsubsidie.step6.mandatory')}: {uploadedMandatoryCount}/{mandatoryDocs.length}
                </Badge>
              )}
            </div>
          </div>
          {!allMandatoryUploaded && (
            <p className="text-warning small mb-0 mt-2">
              <IconifyIcon icon="mingcute:warning-line" className="me-1" />
              {t('bouwsubsidie.step6.mandatoryMissing')}
            </p>
          )}
        </Card.Body>
      </Card>
    </WizardStep>
  )
}

export default Step6Documents

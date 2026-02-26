/**
 * Step 8: Document Upload
 * Phase 5C — Housing Registration Document Upload Implementation
 * 
 * Requires upload of mandatory documents before proceeding.
 * Uses react-dropzone for file handling.
 * Uploads files immediately to Supabase Storage (citizen-uploads bucket).
 * Blocks progression if mandatory documents are not uploaded.
 */

import { useState, useCallback } from 'react'
import { Card, Alert, Badge, Button, Spinner, ProgressBar, Row, Col } from 'react-bootstrap'
import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/integrations/supabase/client'
import WizardStep from '@/components/public/WizardStep'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import type { WizardStepProps, DocumentUpload } from '../types'

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024
// Allowed file types
const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
}

interface DocumentUploadItemProps {
  document: DocumentUpload
  onUpload: (docId: string, file: File) => Promise<void>
  onRemove: (docId: string) => void
  isUploading: boolean
  uploadProgress: number
  error: string | null
}

/**
 * Individual document upload row
 */
const DocumentUploadItem = ({
  document,
  onUpload,
  onRemove,
  isUploading,
  uploadProgress,
  error,
}: DocumentUploadItemProps) => {
  const { t } = useTranslation()
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      await onUpload(document.id, acceptedFiles[0])
    }
  }, [document.id, onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled: isUploading || !!document.uploaded_file,
  })

  const hasUpload = !!document.uploaded_file
  
  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Card className={`${hasUpload ? 'border-success' : document.is_mandatory ? 'border-warning' : ''}`}>
      <Card.Body className="p-3">
        <div className="d-flex align-items-start justify-content-between mb-2">
          <div className="d-flex align-items-start flex-grow-1">
            <div 
              className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${
                hasUpload 
                  ? 'bg-success bg-opacity-10' 
                  : 'bg-secondary bg-opacity-10'
              }`}
              style={{ width: 32, height: 32, minWidth: 32 }}
            >
              <IconifyIcon 
                icon={hasUpload ? 'mingcute:check-line' : 'mingcute:document-line'}
                className={hasUpload ? 'text-success' : 'text-secondary'}
              />
            </div>
            <div className="flex-grow-1">
              <p className="mb-1 fw-medium">{t(document.label)}</p>
              <div className="d-flex align-items-center gap-2">
                <Badge bg={document.is_mandatory ? 'warning' : 'secondary'} className="text-dark">
                  {document.is_mandatory ? t('housing.step8documents.mandatory') : t('housing.step8documents.optional')}
                </Badge>
                {hasUpload && (
                  <Badge bg="success">
                    {t('housing.step8documents.uploaded')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Upload zone or uploaded file info */}
        {hasUpload ? (
          <div className="bg-success bg-opacity-10 rounded p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <IconifyIcon icon="mingcute:file-check-line" className="text-success" />
                <div>
                  <p className="mb-0 small fw-medium">{document.uploaded_file!.file_name}</p>
                  <p className="mb-0 text-muted small">
                    {formatFileSize(document.uploaded_file!.file_size)}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={() => onRemove(document.id)}
              >
                <IconifyIcon icon="mingcute:delete-2-line" className="me-1" />
                {t('common.remove')}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div
              {...getRootProps()}
              className={`border border-2 border-dashed rounded p-3 text-center cursor-pointer ${
                isDragActive ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'
              } ${isUploading ? 'opacity-50' : ''}`}
              style={{ cursor: isUploading ? 'not-allowed' : 'pointer' }}
            >
              <input {...getInputProps()} />
              {isUploading ? (
                <div>
                  <Spinner size="sm" className="me-2" />
                  <span className="text-muted">{t('common.uploading')}</span>
                  {uploadProgress > 0 && (
                    <ProgressBar 
                      now={uploadProgress} 
                      className="mt-2" 
                      style={{ height: 4 }}
                    />
                  )}
                </div>
              ) : (
                <div>
                  <IconifyIcon 
                    icon="mingcute:upload-3-line" 
                    className="text-muted fs-3 mb-2 d-block" 
                  />
                  <p className="mb-1 small">
                    {isDragActive 
                      ? t('housing.step8documents.dropzoneActive')
                      : t('housing.step8documents.dropzone')
                    }
                  </p>
                  <p className="mb-0 text-muted small">
                    {t('housing.step8documents.maxSize')}
                  </p>
                </div>
              )}
            </div>
            {error && (
              <Alert variant="danger" className="mt-2 mb-0 py-2 small">
                {error}
              </Alert>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  )
}

/**
 * Step 8: Document Upload
 */
const Step8Documents = ({ formData, updateFormData, onNext, onBack }: WizardStepProps) => {
  const { t } = useTranslation()
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({})

  // Check if all mandatory documents are uploaded
  const mandatoryDocs = formData.documents.filter(d => d.is_mandatory)
  const uploadedMandatoryCount = mandatoryDocs.filter(d => d.uploaded_file).length
  const allMandatoryUploaded = uploadedMandatoryCount === mandatoryDocs.length
  
  // Total upload count
  const totalUploaded = formData.documents.filter(d => d.uploaded_file).length

  /**
   * Generate a unique session ID for organizing uploads
   * This is used before we have a registration_id
   */
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('housing_session_id')
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      sessionStorage.setItem('housing_session_id', sessionId)
    }
    return sessionId
  }

  /**
   * Handle file upload to Supabase Storage
   */
  const handleUpload = async (docId: string, file: File) => {
    // Clear previous error
    setUploadErrors(prev => ({ ...prev, [docId]: '' }))
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadErrors(prev => ({ 
        ...prev, 
        [docId]: t('housing.step8documents.fileTooLarge') 
      }))
      return
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!validTypes.includes(file.type)) {
      setUploadErrors(prev => ({ 
        ...prev, 
        [docId]: t('housing.step8documents.invalidType') 
      }))
      return
    }

    setUploadingDocId(docId)
    setUploadProgress(0)

    try {
      const sessionId = getSessionId()
      const timestamp = Date.now()
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf'
      const filePath = `housing/${sessionId}/${docId}_${timestamp}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('citizen-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('[Step8Documents] Upload error:', uploadError)
        setUploadErrors(prev => ({ 
          ...prev, 
          [docId]: t('housing.step8documents.uploadError') 
        }))
        return
      }

      // Update form data with uploaded file info
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
      console.error('[Step8Documents] Upload exception:', error)
      setUploadErrors(prev => ({ 
        ...prev, 
        [docId]: t('housing.step8documents.uploadError') 
      }))
    } finally {
      setUploadingDocId(null)
      setUploadProgress(0)
    }
  }

  /**
   * Handle file removal
   */
  const handleRemove = async (docId: string) => {
    const doc = formData.documents.find(d => d.id === docId)
    if (!doc?.uploaded_file) return

    try {
      // Remove from Supabase Storage
      await supabase.storage
        .from('citizen-uploads')
        .remove([doc.uploaded_file.file_path])
    } catch (error) {
      console.error('[Step8Documents] Remove error:', error)
    }

    // Update form data
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
      title={t('housing.step8documents.title')}
      description={t('housing.step8documents.description')}
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!allMandatoryUploaded}
    >
      {/* Info Notice */}
      <Alert variant="info" className="d-flex align-items-start mb-4">
        <IconifyIcon 
          icon="mingcute:information-line" 
          className="text-info fs-4 me-2 mt-1 flex-shrink-0" 
        />
        <div>
          <h6 className="fw-semibold mb-1">{t('housing.step8documents.infoTitle')}</h6>
          <p className="mb-0 small">
            {t('housing.step8documents.infoText')}
          </p>
        </div>
      </Alert>

      {/* Required Documents Section */}
      <h6 className="fw-semibold mb-3">{t('housing.step8documents.mandatory')} ({mandatoryDocs.length})</h6>
      <Row className="g-3 mb-4">
        {formData.documents.filter(d => d.is_mandatory).map(doc => (
          <Col md={6} key={doc.id}>
            <DocumentUploadItem
              document={doc}
              onUpload={handleUpload}
              onRemove={handleRemove}
              isUploading={uploadingDocId === doc.id}
              uploadProgress={uploadingDocId === doc.id ? uploadProgress : 0}
              error={uploadErrors[doc.id] || null}
            />
          </Col>
        ))}
      </Row>

      {/* Optional Documents Section */}
      {formData.documents.some(d => !d.is_mandatory) && (
        <>
          <hr className="my-3" />
          <h6 className="fw-semibold mb-3">{t('housing.step8documents.optional')} ({formData.documents.filter(d => !d.is_mandatory).length})</h6>
          <Row className="g-3">
            {formData.documents.filter(d => !d.is_mandatory).map(doc => (
              <Col md={6} key={doc.id}>
                <DocumentUploadItem
                  document={doc}
                  onUpload={handleUpload}
                  onRemove={handleRemove}
                  isUploading={uploadingDocId === doc.id}
                  uploadProgress={uploadingDocId === doc.id ? uploadProgress : 0}
                  error={uploadErrors[doc.id] || null}
                />
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* Summary */}
      <Card className={`mt-4 ${allMandatoryUploaded ? 'border-success' : 'border-warning'}`}>
        <Card.Body className="py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <span className="text-muted">{t('housing.step8documents.documentsUploaded')}:</span>
              <strong className="ms-2">
                {totalUploaded} {t('housing.step8documents.of')} {formData.documents.length}
              </strong>
            </div>
            <div>
              {allMandatoryUploaded ? (
                <Badge bg="success" className="d-flex align-items-center gap-1">
                  <IconifyIcon icon="mingcute:check-circle-fill" />
                  {t('housing.step8documents.mandatory')}: {uploadedMandatoryCount}/{mandatoryDocs.length}
                </Badge>
              ) : (
                <Badge bg="warning" className="text-dark d-flex align-items-center gap-1">
                  <IconifyIcon icon="mingcute:warning-line" />
                  {t('housing.step8documents.mandatory')}: {uploadedMandatoryCount}/{mandatoryDocs.length}
                </Badge>
              )}
            </div>
          </div>
          {!allMandatoryUploaded && (
            <p className="text-warning small mb-0 mt-2">
              <IconifyIcon icon="mingcute:warning-line" className="me-1" />
              {t('housing.step8documents.mandatoryMissing')}
            </p>
          )}
        </Card.Body>
      </Card>
    </WizardStep>
  )
}

export default Step8Documents

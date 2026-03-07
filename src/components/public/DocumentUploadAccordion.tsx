/**
 * DocumentUploadAccordion
 * V1.8 Phase 2.1 — 3-tab layout: Verplicht / Inkomensbewijs / Optioneel
 * 
 * Fixes UI/validation mismatch: income proof docs with validation_group
 * are now shown in a separate tab with "min. 1 verplicht" indicator.
 */

import { useState, useCallback, useMemo } from 'react'
import { Accordion, Card, Badge, Button, Spinner, ProgressBar, Alert, Tab, Nav } from 'react-bootstrap'
import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'
import IconifyIcon from '@/components/wrapper/IconifyIcon'

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
}

interface UploadedFile {
  file_path: string
  file_name: string
  file_size: number
  uploaded_at: string
}

interface DocumentItem {
  id: string
  document_code: string
  label: string
  is_mandatory: boolean
  category?: string
  validation_group?: string
  uploaded_file?: UploadedFile
}

interface DocumentUploadAccordionProps {
  documents: DocumentItem[]
  onUpload: (docId: string, file: File) => Promise<void>
  onRemove: (docId: string) => void
  uploadingDocId: string | null
  uploadProgress: number
  uploadErrors: Record<string, string>
  /** i18n namespace prefix for labels (e.g. 'bouwsubsidie.step6' or 'housing.step8documents') */
  ns: string
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Single accordion item — collapsed shows status, expanded shows dropzone
 */
const AccordionDocItem = ({
  doc,
  onUpload,
  onRemove,
  isUploading,
  uploadProgress,
  error,
  ns,
}: {
  doc: DocumentItem
  onUpload: (docId: string, file: File) => Promise<void>
  onRemove: (docId: string) => void
  isUploading: boolean
  uploadProgress: number
  error: string | null
  ns: string
}) => {
  const { t } = useTranslation()
  const hasUpload = !!doc.uploaded_file

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      await onUpload(doc.id, acceptedFiles[0])
    }
  }, [doc.id, onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled: isUploading || hasUpload,
  })

  const renderStatusBadge = () => {
    if (hasUpload) {
      return (
        <Badge bg="success" className="d-flex align-items-center gap-1">
          <IconifyIcon icon="mingcute:check-circle-fill" style={{ fontSize: 12 }} />
          {t(`${ns}.uploaded`)}
        </Badge>
      )
    }
    if (doc.is_mandatory) {
      return (
        <Badge bg="warning" className="text-dark">
          {t(`${ns}.mandatory`)}
        </Badge>
      )
    }
    if (doc.validation_group) {
      return (
        <Badge bg="info" className="text-white">
          {t(`${ns}.groupRequired`)}
        </Badge>
      )
    }
    return (
      <Badge bg="secondary" className="text-dark">
        {t(`${ns}.optional`)}
      </Badge>
    )
  }

  return (
    <Accordion.Item eventKey={doc.id} className="border-0 border-bottom">
      <Accordion.Header className="py-0">
        <div className="d-flex align-items-center justify-content-between w-100 me-2">
          <div className="d-flex align-items-center gap-2">
            <div
              className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${
                hasUpload ? 'bg-success bg-opacity-10' : 'bg-secondary bg-opacity-10'
              }`}
              style={{ width: 28, height: 28, minWidth: 28 }}
            >
              <IconifyIcon
                icon={hasUpload ? 'mingcute:check-line' : 'mingcute:document-line'}
                className={hasUpload ? 'text-success' : 'text-secondary'}
                style={{ fontSize: 14 }}
              />
            </div>
            <span className="fw-medium small">{t(doc.label)}</span>
          </div>
          <div className="flex-shrink-0 ms-2">
            {renderStatusBadge()}
          </div>
        </div>
      </Accordion.Header>
      <Accordion.Body className="p-3 pt-2">
        {hasUpload ? (
          <div className="bg-success bg-opacity-10 rounded p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <IconifyIcon icon="mingcute:file-check-line" className="text-success" />
                <div>
                  <p className="mb-0 small fw-medium">{doc.uploaded_file!.file_name}</p>
                  <p className="mb-0 text-muted small">{formatFileSize(doc.uploaded_file!.file_size)}</p>
                </div>
              </div>
              <Button variant="outline-danger" size="sm" onClick={() => onRemove(doc.id)}>
                <IconifyIcon icon="mingcute:delete-2-line" className="me-1" />
                {t('common.remove')}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div
              {...getRootProps()}
              className={`border border-2 border-dashed rounded p-3 text-center ${
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
                    <ProgressBar now={uploadProgress} className="mt-2" style={{ height: 4 }} />
                  )}
                </div>
              ) : (
                <div>
                  <IconifyIcon icon="mingcute:upload-3-line" className="text-muted fs-4 mb-1 d-block" />
                  <p className="mb-1 small">
                    {isDragActive ? t(`${ns}.dropzoneActive`) : t(`${ns}.dropzone`)}
                  </p>
                  <p className="mb-0 text-muted small">{t(`${ns}.maxSize`)}</p>
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
      </Accordion.Body>
    </Accordion.Item>
  )
}

/**
 * Main component: 3-tab accordion document upload list
 * Tab 1: Verplicht (is_mandatory === true)
 * Tab 2: Inkomensbewijs (has validation_group, group-mandatory)
 * Tab 3: Optioneel (remaining)
 */
const DocumentUploadAccordion = ({
  documents,
  onUpload,
  onRemove,
  uploadingDocId,
  uploadProgress,
  uploadErrors,
  ns,
}: DocumentUploadAccordionProps) => {
  const { t } = useTranslation()

  const mandatoryDocs = useMemo(() => documents.filter(d => d.is_mandatory), [documents])
  const incomeGroupDocs = useMemo(() => documents.filter(d => !d.is_mandatory && d.validation_group), [documents])
  const optionalDocs = useMemo(() => documents.filter(d => !d.is_mandatory && !d.validation_group), [documents])

  const hasIncomeTab = incomeGroupDocs.length > 0

  // Auto-expand first un-uploaded mandatory doc
  const firstUnuploadedMandatory = useMemo(
    () => mandatoryDocs.find(d => !d.uploaded_file)?.id || undefined,
    [mandatoryDocs]
  )

  // Auto-expand first un-uploaded income doc
  const firstUnuploadedIncome = useMemo(
    () => incomeGroupDocs.find(d => !d.uploaded_file)?.id || undefined,
    [incomeGroupDocs]
  )

  const allMandatoryUploaded = mandatoryDocs.every(d => d.uploaded_file)
  const hasAnyIncomeUploaded = incomeGroupDocs.some(d => d.uploaded_file)

  // Default to income tab if all mandatory done but no income proof yet
  const defaultTab = allMandatoryUploaded && hasIncomeTab && !hasAnyIncomeUploaded ? 'income' : 'mandatory'
  const [activeTab, setActiveTab] = useState(defaultTab)

  const renderAccordionList = (docs: DocumentItem[], defaultActiveKey?: string) => (
    <Accordion defaultActiveKey={defaultActiveKey} className="border rounded">
      {docs.map(doc => (
        <AccordionDocItem
          key={doc.id}
          doc={doc}
          onUpload={onUpload}
          onRemove={onRemove}
          isUploading={uploadingDocId === doc.id}
          uploadProgress={uploadingDocId === doc.id ? uploadProgress : 0}
          error={uploadErrors[doc.id] || null}
          ns={ns}
        />
      ))}
    </Accordion>
  )

  // No tabs needed if only mandatory docs exist
  if (!hasIncomeTab && optionalDocs.length === 0) {
    return renderAccordionList(mandatoryDocs, firstUnuploadedMandatory)
  }

  return (
    <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'mandatory')}>
      <Nav variant="tabs" className="mb-3" role="tablist">
        <Nav.Item>
          <Nav.Link eventKey="mandatory">
            {t(`${ns}.mandatoryTab`)} ({mandatoryDocs.length})
          </Nav.Link>
        </Nav.Item>
        {hasIncomeTab && (
          <Nav.Item>
            <Nav.Link eventKey="income" className="d-flex align-items-center gap-1">
              {t(`${ns}.incomeProofTab`)} ({incomeGroupDocs.length})
              <Badge 
                bg={hasAnyIncomeUploaded ? 'success' : 'warning'} 
                className={`ms-1 ${hasAnyIncomeUploaded ? '' : 'text-dark'}`}
                style={{ fontSize: '0.65rem' }}
              >
                {t(`${ns}.incomeProofTabNote`)}
              </Badge>
            </Nav.Link>
          </Nav.Item>
        )}
        {optionalDocs.length > 0 && (
          <Nav.Item>
            <Nav.Link eventKey="optional">
              {t(`${ns}.optional`)} ({optionalDocs.length})
            </Nav.Link>
          </Nav.Item>
        )}
      </Nav>
      <Tab.Content>
        <Tab.Pane eventKey="mandatory">
          {renderAccordionList(mandatoryDocs, firstUnuploadedMandatory)}
        </Tab.Pane>
        {hasIncomeTab && (
          <Tab.Pane eventKey="income">
            <Alert variant="info" className="py-2 mb-3 small d-flex align-items-start">
              <IconifyIcon icon="mingcute:information-line" className="text-info me-2 mt-1 flex-shrink-0" />
              <span>{t(`${ns}.incomeProofHint`)}</span>
            </Alert>
            {renderAccordionList(incomeGroupDocs, firstUnuploadedIncome)}
          </Tab.Pane>
        )}
        {optionalDocs.length > 0 && (
          <Tab.Pane eventKey="optional">
            {renderAccordionList(optionalDocs)}
          </Tab.Pane>
        )}
      </Tab.Content>
    </Tab.Container>
  )
}

export default DocumentUploadAccordion

# DVH-IMS V1.3 Phase 5A — Document Upload Implementation Report

**Date:** 2026-02-01  
**Phase:** 5A Part A — Mandatory Document Upload  
**Status:** COMPLETE

---

## 1. Objective

Replace the "document declaration only" toggle in the Bouwsubsidie public wizard with actual mandatory document uploads.

---

## 2. Implementation Summary

### 2.1 Storage Infrastructure

| Component | Implementation |
|-----------|----------------|
| Storage Bucket | `citizen-uploads` (public read, anon write) |
| File Structure | `bouwsubsidie/{sessionId}/{docCode}_{timestamp}.{ext}` |
| Max File Size | 10MB per document |
| Accepted Types | PDF, JPG, JPEG, PNG |

### 2.2 RLS Policies Created

```sql
-- Anonymous upload
CREATE POLICY "anon_can_upload_citizen_documents"
ON storage.objects FOR INSERT TO anon
WITH CHECK (bucket_id = 'citizen-uploads');

-- Anonymous read (for preview)
CREATE POLICY "anon_can_read_citizen_documents"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'citizen-uploads');

-- Staff read
CREATE POLICY "staff_can_read_citizen_documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'citizen-uploads');

-- Document record insert
CREATE POLICY "anon_can_insert_document_upload"
ON public.subsidy_document_upload FOR INSERT TO anon
WITH CHECK (true);
```

---

## 3. Document Requirements

### 3.1 Mandatory Documents (6)

| Code | Label (NL) | Required |
|------|------------|----------|
| ID_COPY | Kopie ID-kaart (voor- en achterkant) | YES |
| INCOME_PROOF | Inkomensverklaring (recente loonstroken) | YES |
| LAND_TITLE | Grondbewijs of erfpachtovereenkomst | YES |
| CONSTRUCTION_PLAN | Bouwplan of tekening | YES |
| COST_ESTIMATE | Gedetailleerde kostenbegroting | YES |
| BUILDING_PERMIT | Bouwvergunning (indien van toepassing) | YES |

### 3.2 Optional Documents (2)

| Code | Label (NL) | Required |
|------|------------|----------|
| BANK_STATEMENT | Bankafschrift (laatste 3 maanden) | NO |
| HOUSEHOLD_COMP | Huishoudsamenstelling | NO |

---

## 4. Component Architecture

### 4.1 Step6Documents.tsx

**Lines of Code:** ~350  
**Dependencies:** react-dropzone, react-i18next

**Key Features:**
- Per-document dropzone with drag-and-drop
- Immediate upload to Supabase Storage
- File size and type validation
- Upload progress indicator
- Remove file functionality
- Mandatory document counter
- Next button disabled until all mandatory uploaded

### 4.2 Data Structure

```typescript
interface DocumentUpload {
  id: string                    // e.g., 'ID_COPY'
  document_code: string         // matches subsidy_document_requirement
  label: string                 // translation key
  is_mandatory: boolean
  uploaded_file?: {
    file_path: string           // storage path
    file_name: string           // original name
    file_size: number           // bytes
    uploaded_at: string         // ISO timestamp
  }
}
```

---

## 5. Edge Function Integration

### 5.1 Input Contract Update

The Edge Function now accepts a `documents` array:

```typescript
documents?: Array<{
  document_code: string
  file_path: string
  file_name: string
  uploaded_at: string
}>
```

### 5.2 Database Linking

After case creation, the Edge Function:
1. Looks up `subsidy_document_requirement` by `document_code`
2. Creates `subsidy_document_upload` records linking files to case
3. Logs document count in audit event

---

## 6. Validation Enforcement

### 6.1 Client-Side

- `nextDisabled={!allMandatoryUploaded}` blocks wizard progression
- File type check: PDF, JPG, JPEG, PNG only
- File size check: Max 10MB per file

### 6.2 Error Handling

| Error Type | User Message (NL) |
|------------|-------------------|
| File too large | "Bestand te groot. Maximum is 10MB." |
| Invalid type | "Ongeldig bestandstype. Gebruik PDF, JPG of PNG." |
| Upload failed | "Upload mislukt. Probeer opnieuw." |

---

## 7. Verification Results

| Test | Result |
|------|--------|
| File upload to storage | ☑ PASS |
| Mandatory blocking | ☑ PASS (UI enforced) |
| File type validation | ☑ PASS |
| File size validation | ☑ PASS |
| Remove file | ☑ PASS |
| Edge Function linking | ☑ PASS |

---

## 8. Files Modified

| File | Change |
|------|--------|
| src/app/(public)/bouwsubsidie/apply/types.ts | Added DocumentUpload interface |
| src/app/(public)/bouwsubsidie/apply/constants.ts | Updated REQUIRED_DOCUMENTS structure |
| src/app/(public)/bouwsubsidie/apply/steps/Step6Documents.tsx | Complete rebuild |
| src/app/(public)/bouwsubsidie/apply/steps/Step7Review.tsx | Document summary display |
| supabase/functions/submit-bouwsubsidie-application/index.ts | Document linking logic |

---

**END OF DOCUMENT UPLOAD REPORT**

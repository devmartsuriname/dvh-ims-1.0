# Phase 10 — Raadvoorstel DOCX Generation

**Project:** VolksHuisvesting IMS (DVH-IMS-1.0)  
**Status:** PENDING  
**Authority:** Delroy (Final)  
**Prerequisite:** Phase 9 Complete

---

## A. Phase Objective

Implement automated DOCX document generation for Bouwsubsidie council proposals (Raadvoorstel), enabling the ministerial approval workflow:

- Create Edge Function for DOCX generation using approved template
- Implement document variable merging from case data
- Configure Supabase Storage bucket for generated documents
- Enable document lifecycle (concept → approved)
- Add document generation trigger in case detail UI
- Display generated documents list with download capability

This phase fulfills the core Raadvoorstel requirement from the Master PRD, enabling officials to generate formal council proposal documents from subsidy case data.

---

## B. Explicit Scope (ALLOWED)

| Category | Allowed Actions |
|----------|-----------------|
| Edge Functions | Create `generate-raadvoorstel` |
| Storage | Configure `generated-documents` bucket |
| Storage | Configure storage RLS policies |
| UI | Add "Generate Raadvoorstel" button in subsidy case detail |
| UI | Display generated documents list in case detail |
| UI | Add document download functionality |
| Workflow | Implement concept/approved document status |
| Audit | Log document generation events |
| Audit | Log document approval/rejection events |

---

## C. Explicit Out of Scope (FORBIDDEN)

| Category | Forbidden Actions |
|----------|-------------------|
| Database | New table creation (use existing `generated_document`) |
| Template | Modifications to Raadvoorstel template structure |
| Features | PDF generation (DOCX only in v1.0) |
| Features | Bulk document generation |
| Features | Document editing within system |
| Features | Digital signatures |
| UI | Public-facing modifications |
| UI | Layout changes to case list or other pages |
| RBAC | Role-based document access (deferred to Phase 11) |

---

## D. Database Impact

### Schema Changes
- **None** — Uses existing `generated_document` table

### Existing Table Structure (generated_document)

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| case_id | uuid | FK to subsidy_case |
| document_type | text | 'raadvoorstel' |
| file_name | text | Generated filename |
| file_path | text | Storage bucket path |
| generated_at | timestamptz | Generation timestamp |
| generated_by | uuid | Generator user ID |

### Storage Configuration

| Bucket | Name | Public | Purpose |
|--------|------|--------|---------|
| generated-documents | generated-documents | NO | Store generated DOCX files |

### Storage RLS Policies

| Policy | Operation | Expression |
|--------|-----------|------------|
| Admin can upload | INSERT | Allowlist pattern |
| Admin can download | SELECT | Allowlist pattern |
| No public access | ALL | Deny anonymous |
| No deletion | DELETE | Deny all (documents are immutable) |

---

## E. Security & RLS Considerations

### Edge Function Security

| Function | Authorization | Validation |
|----------|---------------|------------|
| generate-raadvoorstel | Admin only (allowlist) | case_id UUID validation |

### Document Security
- Documents stored in private bucket
- Download via signed URLs (time-limited)
- No direct public access
- Document path obfuscated
- Generated documents are immutable (no update/delete)

### Access Control (Phase 1)
- Current: Allowlist only (info@devmart.sr)
- Future (Phase 11): Role-based with Minister approval rights

### Audit Requirements
- Generation logged with actor and case reference
- Download logged with actor
- Approval/rejection logged with reason

---

## F. Audit Trail Requirements

### Document Generation Audit

```
entity_type: 'generated_document'
action: 'document_generated'
entity_id: <document ID>
actor_user_id: <generator user ID>
actor_role: 'admin'
metadata_json: {
  case_id: <subsidy case ID>,
  case_number: <case number>,
  document_type: 'raadvoorstel',
  file_name: <generated filename>
}
```

### Document Download Audit

```
entity_type: 'generated_document'
action: 'document_downloaded'
entity_id: <document ID>
actor_user_id: <downloader user ID>
actor_role: 'admin'
metadata_json: {
  case_id: <subsidy case ID>,
  download_timestamp: <ISO datetime>
}
```

### Document Status Change Audit

```
entity_type: 'generated_document'
action: 'document_status_changed'
entity_id: <document ID>
actor_user_id: <actor user ID>
actor_role: 'admin'
metadata_json: {
  from_status: 'concept',
  to_status: 'approved',
  reason: <approval reason if any>
}
```

---

## G. UI Impact

### Changes Allowed

| Component | Location | Change Type |
|-----------|----------|-------------|
| SubsidyCaseDetail | Case detail page | Add "Generate Raadvoorstel" button |
| SubsidyCaseDetail | Case detail page | Add generated documents list |
| DocumentListItem | New component | Display document with download link |
| GenerateDocumentModal | New component | Confirm generation dialog |

### UI Requirements

| Requirement | Implementation |
|-------------|----------------|
| Generate button | Primary action button in case header or actions area |
| Document list | Table or card list showing all generated documents |
| Download action | Icon button or link to download DOCX |
| Status indicator | Badge showing concept/approved status |
| Loading state | Spinner during generation |
| Success feedback | Toast notification on completion |
| Error handling | Toast notification with error message |

### Darkone 1:1 Compliance
- Use existing Darkone button variants
- Use existing Darkone table or card patterns
- Use existing Darkone modal patterns
- Use existing Darkone badge variants
- Use existing Darkone toast patterns
- No custom styling

---

## H. Verification Criteria

### Edge Function Verification
- [ ] generate-raadvoorstel creates valid DOCX file
- [ ] All template variables merged correctly
- [ ] Applicant data populated
- [ ] Household data populated
- [ ] Case details populated
- [ ] District information populated
- [ ] Financial data populated
- [ ] Document stored in Supabase Storage
- [ ] Document record created in generated_document table
- [ ] Invalid case_id returns proper error
- [ ] Unauthorized access blocked

### Storage Verification
- [ ] generated-documents bucket created
- [ ] RLS policies active
- [ ] Private access enforced
- [ ] Signed URL generation works
- [ ] Download via signed URL works

### UI Verification
- [ ] Generate button visible in case detail
- [ ] Generation triggers Edge Function
- [ ] Loading state displays during generation
- [ ] Success toast shows on completion
- [ ] Document appears in list after generation
- [ ] Download link works
- [ ] Darkone 1:1 compliance maintained

### Template Verification
- [ ] DOCX opens in Microsoft Word
- [ ] DOCX opens in LibreOffice
- [ ] Formatting preserved
- [ ] All merge fields populated
- [ ] No broken references
- [ ] Document structure matches template

### Audit Verification
- [ ] Generation logged to audit_event
- [ ] Download logged to audit_event
- [ ] Actor identification correct
- [ ] Metadata complete

---

## I. Restore Point Requirement

### Restore Point Name
`PHASE-10-COMPLETE`

### Restore Point Contents
- Edge Function created and deployed
- Storage bucket configured
- Storage RLS policies active
- UI components created
- Verification checklist completed
- Clean build state

### Rollback Procedure
If Phase 10 verification fails:
1. Revert to PHASE-9-COMPLETE
2. Remove generate-raadvoorstel Edge Function
3. Remove storage bucket (or leave empty)
4. Remove UI components
5. Report failure details
6. Await remediation instructions

---

## J. Hard Stop Statement

**MANDATORY HARD STOP AFTER PHASE 10 COMPLETION**

Upon completing Phase 10:
1. Execute all verification criteria
2. Submit completion report in standard format
3. Create restore point PHASE-10-COMPLETE
4. **STOP** — Do not proceed to Phase 11
5. Await explicit written authorization from Delroy

**NO AUTO-PROCEED TO PHASE 11**

---

## K. Dependencies

| Dependency | Source | Required For |
|------------|--------|--------------|
| Raadvoorstel template | Project assets | Document structure |
| subsidy_case data | Phase 2 | Case details |
| person/household data | Phase 1 | Applicant details |
| generated_document table | Phase 2 | Document storage |
| DOCX library | npm package | Document generation |

### Required Library
- `docx` or similar DOCX generation library for Edge Functions
- Must be Deno-compatible

---

## L. Template Variable Mapping

| Template Variable | Source Table | Source Column |
|-------------------|--------------|---------------|
| {{case_number}} | subsidy_case | case_number |
| {{applicant_name}} | person | first_name + last_name |
| {{applicant_national_id}} | person | national_id |
| {{district}} | subsidy_case | district_code |
| {{household_size}} | household | household_size |
| {{requested_amount}} | subsidy_case | requested_amount |
| {{approved_amount}} | subsidy_case | approved_amount |
| {{application_date}} | subsidy_case | created_at |
| {{current_status}} | subsidy_case | status |
| {{address}} | address | address_line_1, address_line_2 |

---

## M. Governance References

- Master PRD: Section 3.2 (Raadvoorstel Generation)
- Architecture & Security: Section 8 (Edge Functions)
- Raadvoorstel Template: Reference document
- Execution Plan: Phase 2 outputs (deferred item)

---

**End of Phase 10 Documentation**

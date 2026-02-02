
# DVH-IMS V1.3 — Phase 5C Task 2: Admin Documents Tab Implementation

## SMOKE TEST SUMMARY (Task 1)

| Service | Status | Evidence |
|---------|--------|----------|
| Housing Registration Wizard | ✅ PASS | 11 steps visible, NL localization working, Documenten step at position 8 |
| Landing Page NL | ✅ PASS | Dutch labels: "Welkom bij VolksHuisvesting", service cards in NL |
| Console Errors | ✅ PASS | No errors detected |
| Database Setup | ✅ PASS | 6 document requirements seeded (3 mandatory, 3 optional) |

**Note:** Full E2E with file upload requires manual testing due to browser automation limitations with file inputs.

---

## ADMIN DOCUMENTS TAB IMPLEMENTATION (Task 2)

### Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE5C_ADMIN_START.md` | CREATE | Pre-admin changes restore point |
| `src/app/(admin)/housing-registrations/[id]/page.tsx` | MODIFY | Add Documents tab |
| `restore-points/v1.3/RESTORE_POINT_V1.3_PHASE5C_ADMIN_COMPLETE.md` | CREATE | Post-admin changes restore point |

### Implementation Steps

**Step 1: Create Pre-Implementation Restore Point**

**Step 2: Modify Housing Registration Detail Page**

Add to the existing `Tabs` component (line 240):
- New state: `documents` and `documentRequirements`
- Fetch documents in `fetchRegistration()` function
- Add Documents tab after History tab

**Documents Tab Content:**
```text
- Table with columns:
  - Document Name (from housing_document_requirement)
  - Required/Optional (Badge: mandatory = danger, optional = secondary)
  - File Link (download link from citizen-uploads bucket)
  - Verified (Checkbox with is_verified toggle)
  - Uploaded At (timestamp)
- Verification handler with:
  - Update is_verified, verified_by, verified_at
  - Audit log entry for DOCUMENT_VERIFIED
```

### Database Queries Required

```sql
-- Fetch documents for registration
SELECT 
  du.id,
  du.file_path,
  du.file_name,
  du.is_verified,
  du.verified_by,
  du.verified_at,
  du.uploaded_at,
  dr.document_name,
  dr.document_code,
  dr.is_mandatory
FROM housing_document_upload du
JOIN housing_document_requirement dr ON du.requirement_id = dr.id
WHERE du.registration_id = :registrationId
```

### RLS Verification

| Policy | Table | Access |
|--------|-------|--------|
| `role_select_housing_document_upload` | housing_document_upload | District-scoped staff SELECT ✅ |
| `role_update_housing_document_upload` | housing_document_upload | District-scoped staff UPDATE (is_verified) ✅ |

### UI Components (Darkone Pattern)

- React-Bootstrap `Table` with hover
- `Badge` for mandatory/optional indicator
- `Form.Check` for verification toggle
- `Button` with download icon for file link
- Toast notifications for success/error

### Explicitly OUT OF SCOPE

- Document deletion
- Re-upload from admin
- Status transitions based on document verification
- Bouwsubsidie admin UI changes

---

## Task 3: Documentation & Governance

### Deliverables

1. `RESTORE_POINT_V1.3_PHASE5C_ADMIN_START.md` - Before admin changes
2. `RESTORE_POINT_V1.3_PHASE5C_ADMIN_COMPLETE.md` - After admin changes
3. Update `PHASE-5C-DOCUMENT-UPLOAD-REPORT.md` with admin changes summary

---

## END-OF-TASK REPORT FORMAT

After implementation:

```
IMPLEMENTED
- Documents tab in housing-registrations/[id]/page.tsx
- Verification toggle with audit logging
- File download links

PARTIAL
- (List any partial items)

SKIPPED
- Bouwsubsidie admin UI (out of scope)
- Document deletion (out of scope)

VERIFICATION
- Documents tab renders correctly
- Verification toggle works
- Audit log entries created

RESTORE POINTS
- RESTORE_POINT_V1.3_PHASE5C_ADMIN_START.md
- RESTORE_POINT_V1.3_PHASE5C_ADMIN_COMPLETE.md

BLOCKERS / ERRORS
- NONE (or list any)
```

---

## STOP CONDITION

After completing Tasks 2 and 3:
- STOP and report
- Await explicit authorization for next phase

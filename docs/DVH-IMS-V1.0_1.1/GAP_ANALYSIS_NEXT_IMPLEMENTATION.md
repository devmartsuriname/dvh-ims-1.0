# VolksHuisvesting IMS — Gap Analysis & Next Implementation

**Version:** v1.1  
**Status:** Documentation Only  
**Last Updated:** 2026-01-24  
**Comparison Base:** Master PRD, Architecture_Security.md, UX_Admin_Flows.md, Database_RLS.md

---

## 1. Methodology

This analysis compares:
- **Documented Requirements:** Master PRD, Architecture docs, UX flows
- **Current Implementation:** Codebase, migrations, RLS policies

Each gap is:
- Classified by priority (P0/P1/P2)
- Backed by specific file/table/policy evidence
- Noted with NO implementation promises

---

## 2. Gap Priority Definitions

| Priority | Definition | Action |
|----------|------------|--------|
| **P0** | Security blocker — must be fixed before production | STOP deployment |
| **P1** | Core workflow incomplete — affects primary use cases | Required for full functionality |
| **P2** | Polish/UX — non-blocking improvements | Deferred to future versions |

---

## 3. P0 — Security Blockers

| # | Gap | Evidence Searched | Result |
|---|-----|-------------------|--------|
| - | None identified | All 24 tables verified for RLS | ✅ All tables have RLS enabled |
| - | None identified | Edge Functions checked for RBAC | ✅ All authenticated functions have role checks |
| - | None identified | Service role usage reviewed | ✅ All justified with mitigations |

### P0 Status: **CLEAR**

No security blockers identified. System is production-ready from a security perspective.

---

## 4. P1 — Core Workflow Gaps

### 4.1 User & Role Management UI

| Aspect | Details |
|--------|---------|
| **Documented In** | UX_Admin_Flows.md Section 7, Architecture_Security.md |
| **Current State** | NOT IMPLEMENTED |
| **Evidence** | No `/users` or `/roles` route in `src/routes/index.tsx` |
| **Impact** | Roles must be assigned via direct database access |
| **Tables Exist** | ✅ `user_roles`, `app_user_profile` |
| **RLS Exists** | ✅ `system_admin` policies for role management |

**Gap Summary:** Backend ready, no admin UI.

---

### 4.2 Social Field Worker Report Form

| Aspect | Details |
|--------|---------|
| **Documented In** | UX_Admin_Flows.md Section 2.2 |
| **Current State** | PARTIAL |
| **Evidence** | Table `social_report` exists with RLS; No dedicated form component found in `/subsidy-cases/[id]/` |
| **Impact** | Social workers cannot submit structured field reports via UI |
| **Workaround** | Manual database entry or generic JSON update |

**Gap Summary:** Table + RLS ready, form UI missing.

---

### 4.3 Technical Inspector Report Form

| Aspect | Details |
|--------|---------|
| **Documented In** | UX_Admin_Flows.md Section 2.2 |
| **Current State** | PARTIAL |
| **Evidence** | Table `technical_report` exists with RLS; No dedicated form component found |
| **Impact** | Technical inspectors cannot submit structured reports via UI |
| **Workaround** | Manual database entry or generic JSON update |

**Gap Summary:** Table + RLS ready, form UI missing.

---

### 4.4 Raadvoorstel Approval Workflow UI

| Aspect | Details |
|--------|---------|
| **Documented In** | UX_Admin_Flows.md Section 4.5, Master PRD Section 6.4 |
| **Current State** | PARTIAL |
| **Evidence** | `generate-raadvoorstel` Edge Function works; `generated_document` table exists; No Minister approval UI step in case detail |
| **Impact** | Minister approval is not captured in structured workflow |
| **Workaround** | Status update with reason field |

**Gap Summary:** Generation works, approval step UI missing.

---

### 4.5 Document Checklist Tab (Subsidy Cases)

| Aspect | Details |
|--------|---------|
| **Documented In** | UX_Admin_Flows.md Section 2.1 |
| **Current State** | PARTIAL |
| **Evidence** | Tables `subsidy_document_requirement`, `subsidy_document_upload` exist; Case detail page exists but tab structure not fully implemented |
| **Impact** | Document tracking not visible in structured tab format |

**Gap Summary:** Backend ready, UI tab incomplete.

---

### P1 Summary Table

| # | Gap | Backend Ready | UI Ready | Priority |
|---|-----|---------------|----------|----------|
| 1 | User & Role Management UI | ✅ Yes | ❌ No | P1 |
| 2 | Social Report Form | ✅ Yes | ❌ No | P1 |
| 3 | Technical Report Form | ✅ Yes | ❌ No | P1 |
| 4 | Raadvoorstel Approval UI | ✅ Yes | ❌ No | P1 |
| 5 | Document Checklist Tab | ✅ Yes | ⚠️ Partial | P1 |

---

## 5. P2 — Polish / UX Gaps

### 5.1 Case Detail Tabs Structure

| Aspect | Details |
|--------|---------|
| **Documented In** | UX_Admin_Flows.md Section 2.1 |
| **Expected Tabs** | Overview, Documents, Reports, History, Raadvoorstel |
| **Current State** | Single-page layout without explicit tabs |
| **Impact** | Information density may affect usability |

---

### 5.2 Bulk Operations

| Aspect | Details |
|--------|---------|
| **Documented In** | Not explicitly documented |
| **Current State** | NOT IMPLEMENTED |
| **Evidence** | All admin tables are single-record operations |
| **Impact** | Efficiency for high-volume processing |

---

### 5.3 Advanced Filtering & Export

| Aspect | Details |
|--------|---------|
| **Documented In** | UX_Admin_Flows.md (implied) |
| **Current State** | PARTIAL |
| **Evidence** | Audit log has export; Other modules have basic filtering only |
| **Impact** | Reporting flexibility limited |

---

### 5.4 Print-Friendly Views

| Aspect | Details |
|--------|---------|
| **Documented In** | Not explicitly documented |
| **Current State** | NOT IMPLEMENTED |
| **Evidence** | No print CSS or print-specific components |
| **Impact** | Physical document needs require manual formatting |

---

### 5.5 Loading States & Skeleton Screens

| Aspect | Details |
|--------|---------|
| **Documented In** | UX best practices |
| **Current State** | PARTIAL |
| **Evidence** | Some components have loading states; Not consistent |
| **Impact** | User experience during data fetching |

---

### P2 Summary Table

| # | Gap | Impact Level | Priority |
|---|-----|--------------|----------|
| 1 | Case Detail Tabs | Low | P2 |
| 2 | Bulk Operations | Medium | P2 |
| 3 | Advanced Filtering | Low | P2 |
| 4 | Print Views | Low | P2 |
| 5 | Loading States | Low | P2 |

---

## 6. Explicitly NOT Gaps (Confirmed Out of Scope)

The following are NOT implementation gaps — they are intentionally excluded:

| Item | Documented Exclusion | Reference |
|------|---------------------|-----------|
| Housing inventory management | Master PRD Section 4 | OUT OF SCOPE v1.x |
| Objection/appeal procedures | Master PRD Section 4 | OUT OF SCOPE v1.x |
| Citizen accounts | Master PRD Section 4 | OUT OF SCOPE v1.x |
| Dark theme (public) | Architecture_Security.md | OUT OF SCOPE v1.x |
| Policy analytics | Master PRD Section 4 | OUT OF SCOPE v1.x |
| Delete actions in UI | Guardian Rules | Intentionally excluded |
| Settings module | v1.1 Closure | Not planned |
| Notification backend | v1.1 Closure | Not implemented |

---

## 7. Implementation Readiness Matrix

| Gap Category | Backend | RLS | UI | Status |
|--------------|---------|-----|----| -------|
| User Management | ✅ | ✅ | ❌ | Ready for UI work |
| Field Reports | ✅ | ✅ | ❌ | Ready for UI work |
| Approval Workflow | ✅ | ✅ | ❌ | Ready for UI work |
| Document Tabs | ✅ | ✅ | ⚠️ | Needs tab refactor |
| Core Workflows | ✅ | ✅ | ✅ | Complete |
| Security | ✅ | ✅ | ✅ | Complete |

---

## 8. Recommended Priority Order (No Promises)

If future implementation is authorized:

1. **User & Role Management UI** — Enables self-service role assignment
2. **Social Report Form** — Completes Bouwsubsidie workflow
3. **Technical Report Form** — Completes Bouwsubsidie workflow
4. **Raadvoorstel Approval UI** — Formalizes Minister approval step
5. **Document Checklist Tab** — Improves document tracking visibility

---

## 9. Evidence References

### Files Reviewed

| Category | Files |
|----------|-------|
| Routes | `src/routes/index.tsx`, `src/routes/router.tsx` |
| Components | `src/app/(admin)/**/page.tsx`, `src/app/(admin)/**/components/*` |
| Hooks | `src/hooks/useUserRole.ts`, `src/hooks/useAuditLog.ts` |
| Edge Functions | `supabase/functions/*/index.ts` |
| Documentation | `docs/*.md`, `phases/*.md` |

### Tables Verified

All 24 tables in public schema verified for RLS status.

### Migrations Referenced

| Migration | Content |
|-----------|---------|
| `20260109002014_add_rbac_and_district_scoping.sql` | Role system, SECURITY DEFINER functions |
| Various status history migrations | Immutable audit patterns |

---

## 10. Conclusion

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   GAP ANALYSIS SUMMARY                                     ║
║                                                            ║
║   P0 (Security Blockers):     0                            ║
║   P1 (Core Workflow Gaps):    5                            ║
║   P2 (Polish/UX Gaps):        5                            ║
║                                                            ║
║   PRODUCTION READINESS:       YES (security complete)      ║
║   FULL FEATURE READINESS:     NO (P1 gaps remain)          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

---

**End of Gap Analysis**

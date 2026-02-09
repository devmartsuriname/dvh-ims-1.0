
# DVH-IMS V1.5 — Test Execution Pack and Bug Triage Protocol

**Type:** Documentation-only (no code changes)
**Output:** Single consolidated document at `/docs/DVH-IMS-V1.5/Test_and_Stabilization/Test_Execution_Pack.md`

---

## Deliverable

One comprehensive markdown document containing all three sections specified in the instruction:

### Part A: Role-Based Test Scenarios (10 scenarios)

Each scenario covers one role with preconditions, actions, expected results, and PASS/FAIL criteria:

1. `frontdesk_bouwsubsidie` -- Control Queue intake, document verification
2. `frontdesk_housing` -- Housing registration review, document verification
3. `admin_staff` -- Administrative review panel, dossier read access
4. `social_field_worker` -- Social review form, draft/finalize flow
5. `technical_inspector` -- Technical review form, draft/finalize flow
6. `project_leader` -- Case assignments (create/reassign/revoke), policy review
7. `director` -- Director approval panel, archive read access, audit log read access
8. `ministerial_advisor` -- Advisory review panel, archive read access, audit log read access
9. `minister` -- Ministerial decision panel, archive read access
10. `system_admin` -- Full admin access, assignment management, all modules visible
11. `audit` -- Read-only verification across all permitted modules

### Part B: End-to-End Workflow Tests (5 tests)

1. Bouwsubsidie full lifecycle (intake through archive)
2. Woningregistratie lifecycle (intake through archive)
3. Assignments lifecycle (assign, reassign, revoke, complete + audit entries)
4. Audit Log verification (fields, role-based visibility)
5. Archive verification (read-only enforcement, search, access restrictions)

### Part C: Bug Triage Protocol

- Four severity levels: Blocker, Major, Minor, Cosmetic
- Required bug report fields aligned with existing `06_Bug_Reporting_Process.md`
- Rules: reproducibility requirement, authorization gate, restore point mandate
- Acceptance criteria: PASS/FAIL/BLOCKER definitions

---

## Technical Notes

- Directory `docs/DVH-IMS-V1.5/Test_and_Stabilization/` will be created
- Single file: `Test_Execution_Pack.md`
- References existing operational docs and the Admin Access Matrix
- Aligned with the existing bug reporting process in `06_Bug_Reporting_Process.md` (no duplication, cross-references where appropriate)
- All test scenarios reference exact routes and role identifiers as implemented in the codebase

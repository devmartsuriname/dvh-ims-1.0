/**
 * Shared Document Requirements Configuration
 * 
 * SINGLE SOURCE OF TRUTH for document requirements across:
 * - Public wizards (Bouwsubsidie + Woningregistratie)
 * - Admin case detail views (Required Documents panel)
 * 
 * DO NOT duplicate document lists elsewhere.
 * All document requirement definitions MUST reference this module.
 * 
 * V1.7.x — Sync fix: wizard → admin alignment
 */

export interface DocumentRequirementConfig {
  document_code: string
  document_name: string
  is_mandatory: boolean
}

/**
 * Bouwsubsidie document requirements
 * 5 mandatory + 2 optional
 * 
 * Canonical set per V1.5 update:
 * - Deprecated types (Construction Plan, Cost Estimate, Building Permit)
 *   are excluded from this config and hidden from UI.
 */
export const BOUWSUBSIDIE_DOCUMENT_REQUIREMENTS: DocumentRequirementConfig[] = [
  { document_code: 'ID_COPY', document_name: 'Copy of ID', is_mandatory: true },
  { document_code: 'INCOME_PROOF', document_name: 'Inkomensverklaring (AOV/loonstrook)', is_mandatory: true },
  { document_code: 'LAND_TITLE', document_name: 'Land Title / Deed', is_mandatory: true },
  { document_code: 'BANK_STATEMENT', document_name: 'Bank Statement', is_mandatory: true },
  { document_code: 'HOUSEHOLD_COMP', document_name: 'Household Composition', is_mandatory: true },
  { document_code: 'CBB_EXTRACT', document_name: 'CBB uittreksel / Nationaliteit verklaring', is_mandatory: false },
  { document_code: 'FAMILY_EXTRACT', document_name: 'Gezinuittreksel', is_mandatory: false },
]

/**
 * Woningregistratie document requirements
 * 3 mandatory + 3 optional
 */
export const HOUSING_DOCUMENT_REQUIREMENTS: DocumentRequirementConfig[] = [
  { document_code: 'ID_COPY', document_name: 'Copy of ID', is_mandatory: true },
  { document_code: 'INCOME_PROOF', document_name: 'Income Proof', is_mandatory: true },
  { document_code: 'RESIDENCE_PROOF', document_name: 'Residence Proof', is_mandatory: true },
  { document_code: 'FAMILY_COMPOSITION', document_name: 'Family Composition', is_mandatory: false },
  { document_code: 'MEDICAL_CERT', document_name: 'Medical Certificate', is_mandatory: false },
  { document_code: 'EMERGENCY_PROOF', document_name: 'Emergency Proof', is_mandatory: false },
]

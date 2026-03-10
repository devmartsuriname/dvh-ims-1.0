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
 * V1.8 Phase 2 — Expanded Bouwsubsidie config with category + validation_group
 */

export interface DocumentRequirementConfig {
  document_code: string
  document_name: string
  is_mandatory: boolean
  category?: string
  validation_group?: string
}

/**
 * Bouwsubsidie document requirements
 * 14 active documents: 2 mandatory + 4 group-mandatory (income_proof) + 8 optional
 * 
 * V1.8: Expanded from 7 to 14 active docs.
 * Deprecated codes (INCOME_PROOF, LAND_TITLE, HOUSEHOLD_COMP, etc.) are
 * soft-deprecated in DB (is_active = false) and excluded from this config.
 */
export const BOUWSUBSIDIE_DOCUMENT_REQUIREMENTS: DocumentRequirementConfig[] = [
  // identity — mandatory
  { document_code: 'ID_COPY', document_name: 'Kopie ID-kaart', is_mandatory: true, category: 'identity' },

  // income — group-mandatory (at least 1 required via validation_group)
  { document_code: 'PAYSLIP', document_name: 'Loonstrook', is_mandatory: false, category: 'income', validation_group: 'income_proof' },
  { document_code: 'AOV_STATEMENT', document_name: 'AOV-verklaring', is_mandatory: false, category: 'income', validation_group: 'income_proof' },
  { document_code: 'PENSION_STATEMENT', document_name: 'Pensioenverklaring', is_mandatory: false, category: 'income', validation_group: 'income_proof' },
  { document_code: 'EMPLOYER_DECLARATION', document_name: 'Werkgeversverklaring', is_mandatory: false, category: 'income', validation_group: 'income_proof' },

  // identity — mandatory
  { document_code: 'NATIONALITY_DECLARATION', document_name: 'Nationaliteitverklaring', is_mandatory: true, category: 'identity' },

  // property — optional
  { document_code: 'PROPERTY_DEED', document_name: 'Grondbewijs / eigendomsbewijs', is_mandatory: false, category: 'property' },
  { document_code: 'GLIS_EXTRACT', document_name: 'GLIS-uittreksel', is_mandatory: false, category: 'property' },
  { document_code: 'PARCEL_MAP', document_name: 'Perceelkaart', is_mandatory: false, category: 'property' },

  // legal — optional
  { document_code: 'NOTARIAL_DEED', document_name: 'Notariële akte', is_mandatory: false, category: 'legal' },
  { document_code: 'PURCHASE_AGREEMENT', document_name: 'Koopovereenkomst', is_mandatory: false, category: 'legal' },

  // special — optional
  { document_code: 'ESTATE_PERMISSION', document_name: 'Boedelgrondverklaring', is_mandatory: false, category: 'special' },
  { document_code: 'MORTGAGE_EXTRACT', document_name: 'Hypotheekuittreksel', is_mandatory: false, category: 'special' },
  { document_code: 'VILLAGE_AUTHORITY', document_name: 'Verklaring dorpshoofd', is_mandatory: false, category: 'special' },
]

/**
 * Ordered list of Bouwsubsidie document categories for UI grouping
 */
export const BOUWSUBSIDIE_DOCUMENT_CATEGORIES = [
  'identity', 'income', 'financial', 'property', 'legal', 'special',
] as const

/**
 * Validation group identifier for income proof documents
 * Used by Step 6 validation to enforce at-least-one-of-group rule
 */
export const BOUWSUBSIDIE_INCOME_GROUP = 'income_proof'

/**
 * Woningregistratie document requirements
 * 3 mandatory + 3 optional
 * UNCHANGED in V1.8
 */
export const HOUSING_DOCUMENT_REQUIREMENTS: DocumentRequirementConfig[] = [
  { document_code: 'ID_COPY', document_name: 'Copy of ID', is_mandatory: true },
  { document_code: 'INCOME_PROOF', document_name: 'Income Proof', is_mandatory: true },
  { document_code: 'RESIDENCE_PROOF', document_name: 'Residence Proof', is_mandatory: true },
  { document_code: 'FAMILY_COMPOSITION', document_name: 'Family Composition', is_mandatory: false },
  { document_code: 'MEDICAL_CERT', document_name: 'Medical Certificate', is_mandatory: false },
  { document_code: 'EMERGENCY_PROOF', document_name: 'Emergency Proof', is_mandatory: false },
]

/**
 * DVH-IMS V1.2 Role Definitions
 * 
 * DOCUMENT TYPE: TypeScript Type Definitions (Prepared)
 * VERSION: 1.0
 * DATE: 2026-01-30
 * PHASE: Phase 3 — Role & Workflow Activation Preparation
 * STATUS: PREPARED — NOT ACTIVE
 * 
 * CRITICAL: This file is NOT imported by any operational code.
 * It serves as documentation in TypeScript form for the V1.2 role model.
 * 
 * ACTIVATION REQUIRES:
 * 1. Database enum extension
 * 2. RLS policy creation
 * 3. Explicit authorization from Delroy
 */

// ============================================================================
// CURRENT ACTIVE ROLES (7 roles - V1.1 baseline)
// ============================================================================

/**
 * Current active roles in the system.
 * These roles are operational and have accounts assigned.
 */
export type ActiveAppRole = 
  | 'system_admin'
  | 'minister'
  | 'project_leader'
  | 'frontdesk_bouwsubsidie'
  | 'frontdesk_housing'
  | 'admin_staff'
  | 'audit';

// ============================================================================
// PREPARED ROLES (4 roles - NOT ACTIVE)
// ============================================================================

/**
 * Prepared roles that are documented but NOT instantiated.
 * These roles require database enum extension before activation.
 * 
 * STATUS: PREPARED — NOT ACTIVE
 */
export type PreparedAppRole = 
  | 'social_field_worker'
  | 'technical_inspector'
  | 'director'
  | 'ministerial_advisor';

// ============================================================================
// COMPLETE V1.2 ROLE MODEL (11 roles)
// ============================================================================

/**
 * Complete V1.2 role model (for future activation).
 * DO NOT USE THIS TYPE IN OPERATIONAL CODE.
 */
export type V12AppRole = ActiveAppRole | PreparedAppRole;

// ============================================================================
// ROLE METADATA DEFINITIONS
// ============================================================================

/**
 * Scope type for role access control.
 */
export type RoleScopeType = 'national' | 'district';

/**
 * Service applicability for roles.
 */
export type ServiceApplicability = 'bouwsubsidie' | 'woningregistratie' | 'both' | 'technical';

/**
 * Role metadata definition.
 */
export interface RoleMetadata {
  /** Proposed or active enum value */
  enumValue: V12AppRole;
  /** Dutch display name */
  dutchName: string;
  /** English display name */
  englishName: string;
  /** Service applicability */
  serviceApplicability: ServiceApplicability;
  /** Decision chain position (null for non-workflow roles) */
  decisionChainPosition: number | null;
  /** Parallel processing indicator */
  isParallel: boolean;
  /** Scope type */
  scopeType: RoleScopeType;
  /** Current activation status */
  isActive: boolean;
  /** Core authority description */
  coreAuthority: string;
}

/**
 * Complete role metadata registry.
 * 
 * STATUS: PREPARED — FOR DOCUMENTATION ONLY
 */
export const V12_ROLE_METADATA: Record<V12AppRole, RoleMetadata> = {
  // ============================================
  // TECHNICAL ROLES
  // ============================================
  system_admin: {
    enumValue: 'system_admin',
    dutchName: 'Systeembeheerder',
    englishName: 'System Administrator',
    serviceApplicability: 'technical',
    decisionChainPosition: null,
    isParallel: false,
    scopeType: 'national',
    isActive: true,
    coreAuthority: 'Full system access, user management, configuration',
  },
  audit: {
    enumValue: 'audit',
    dutchName: 'Auditor',
    englishName: 'Auditor',
    serviceApplicability: 'both',
    decisionChainPosition: null,
    isParallel: false,
    scopeType: 'national',
    isActive: true,
    coreAuthority: 'Read-only access to all records and audit logs',
  },

  // ============================================
  // INTAKE ROLES (Step 1)
  // ============================================
  frontdesk_bouwsubsidie: {
    enumValue: 'frontdesk_bouwsubsidie',
    dutchName: 'Frontdesk Bouwsubsidie',
    englishName: 'Frontdesk (Building Subsidy)',
    serviceApplicability: 'bouwsubsidie',
    decisionChainPosition: 1,
    isParallel: false,
    scopeType: 'district',
    isActive: true,
    coreAuthority: 'Intake, registration, document collection for building subsidies',
  },
  frontdesk_housing: {
    enumValue: 'frontdesk_housing',
    dutchName: 'Frontdesk Woningregistratie',
    englishName: 'Frontdesk (Housing Registration)',
    serviceApplicability: 'woningregistratie',
    decisionChainPosition: 1,
    isParallel: false,
    scopeType: 'district',
    isActive: true,
    coreAuthority: 'Intake, registration, document collection for housing',
  },

  // ============================================
  // ASSESSMENT ROLES (Step 1P, Step 2) - PREPARED
  // ============================================
  social_field_worker: {
    enumValue: 'social_field_worker',
    dutchName: 'Sociaal Veldwerker',
    englishName: 'Social Field Worker',
    serviceApplicability: 'both',
    decisionChainPosition: 1, // Parallel with Frontdesk
    isParallel: true,
    scopeType: 'district',
    isActive: false, // PREPARED — NOT ACTIVE
    coreAuthority: 'Social assessment, household evaluation, urgency determination',
  },
  technical_inspector: {
    enumValue: 'technical_inspector',
    dutchName: 'Technisch Inspecteur',
    englishName: 'Technical Inspector',
    serviceApplicability: 'bouwsubsidie', // BS only
    decisionChainPosition: 2,
    isParallel: false,
    scopeType: 'district',
    isActive: false, // PREPARED — NOT ACTIVE
    coreAuthority: 'Technical assessment, budget verification, construction feasibility',
  },

  // ============================================
  // ADMINISTRATIVE ROLES (Step 3)
  // ============================================
  admin_staff: {
    enumValue: 'admin_staff',
    dutchName: 'Administratief Medewerker',
    englishName: 'Administrative Officer',
    serviceApplicability: 'both',
    decisionChainPosition: 3,
    isParallel: false,
    scopeType: 'district',
    isActive: true,
    coreAuthority: 'Dossier completeness verification, document management',
  },

  // ============================================
  // LEADERSHIP ROLES (Steps 4-7)
  // ============================================
  project_leader: {
    enumValue: 'project_leader',
    dutchName: 'Projectleider / Onderdirecteur',
    englishName: 'Project Leader / Deputy Director',
    serviceApplicability: 'both',
    decisionChainPosition: 4,
    isParallel: false,
    scopeType: 'national',
    isActive: true,
    coreAuthority: 'Policy compliance review, case progression approval',
  },
  director: {
    enumValue: 'director',
    dutchName: 'Directeur',
    englishName: 'Director',
    serviceApplicability: 'both',
    decisionChainPosition: 5,
    isParallel: false,
    scopeType: 'national',
    isActive: false, // PREPARED — NOT ACTIVE
    coreAuthority: 'Organizational approval, final decision for WR, escalation for BS',
  },
  ministerial_advisor: {
    enumValue: 'ministerial_advisor',
    dutchName: 'Beleidsadviseur Minister',
    englishName: 'Ministerial Policy Advisor',
    serviceApplicability: 'bouwsubsidie', // BS only
    decisionChainPosition: 6,
    isParallel: false,
    scopeType: 'national',
    isActive: false, // PREPARED — NOT ACTIVE
    coreAuthority: 'Advisory review, paraaf (initialing), briefing preparation',
  },
  minister: {
    enumValue: 'minister',
    dutchName: 'Minister',
    englishName: 'Minister',
    serviceApplicability: 'bouwsubsidie', // BS only (final decision)
    decisionChainPosition: 7,
    isParallel: false,
    scopeType: 'national',
    isActive: true,
    coreAuthority: 'Final decision authority for building subsidies',
  },
};

// ============================================================================
// DECISION CHAIN DEFINITIONS
// ============================================================================

/**
 * Decision chain step definition.
 */
export interface DecisionChainStep {
  step: number;
  role: V12AppRole;
  isParallel: boolean;
  fromStatuses: string[];
  toStatuses: string[];
  description: string;
}

/**
 * Bouwsubsidie decision chain (7 steps + parallel).
 * 
 * STATUS: PREPARED — FOR DOCUMENTATION ONLY
 */
export const BOUWSUBSIDIE_DECISION_CHAIN: DecisionChainStep[] = [
  {
    step: 1,
    role: 'frontdesk_bouwsubsidie',
    isParallel: false,
    fromStatuses: ['NEW'],
    toStatuses: ['SUBMITTED'],
    description: 'Intake and registration',
  },
  {
    step: 1, // Parallel
    role: 'social_field_worker',
    isParallel: true,
    fromStatuses: ['SUBMITTED'],
    toStatuses: ['IN_SOCIAL_REVIEW', 'SOCIAL_COMPLETED'],
    description: 'Social assessment (parallel)',
  },
  {
    step: 2,
    role: 'technical_inspector',
    isParallel: false,
    fromStatuses: ['SOCIAL_COMPLETED'],
    toStatuses: ['IN_TECHNICAL_REVIEW', 'TECHNICAL_APPROVED', 'TECHNICAL_REJECTED'],
    description: 'Technical inspection',
  },
  {
    step: 3,
    role: 'admin_staff',
    isParallel: false,
    fromStatuses: ['TECHNICAL_APPROVED'],
    toStatuses: ['IN_ADMIN_REVIEW', 'ADMIN_COMPLETE'],
    description: 'Dossier completeness check',
  },
  {
    step: 4,
    role: 'project_leader',
    isParallel: false,
    fromStatuses: ['ADMIN_COMPLETE'],
    toStatuses: ['IN_POLICY_REVIEW', 'POLICY_APPROVED'],
    description: 'Policy compliance review',
  },
  {
    step: 5,
    role: 'director',
    isParallel: false,
    fromStatuses: ['POLICY_APPROVED'],
    toStatuses: ['IN_DIRECTOR_REVIEW', 'DIRECTOR_APPROVED', 'DIRECTOR_REJECTED'],
    description: 'Organizational approval',
  },
  {
    step: 6,
    role: 'ministerial_advisor',
    isParallel: false,
    fromStatuses: ['DIRECTOR_APPROVED'],
    toStatuses: ['IN_MINISTERIAL_ADVICE', 'ADVICE_COMPLETE'],
    description: 'Ministerial advice and paraaf',
  },
  {
    step: 7,
    role: 'minister',
    isParallel: false,
    fromStatuses: ['ADVICE_COMPLETE'],
    toStatuses: ['APPROVED', 'REJECTED'],
    description: 'Final decision',
  },
];

/**
 * Woningregistratie decision chain (5 steps).
 * 
 * STATUS: PREPARED — FOR DOCUMENTATION ONLY
 */
export const WONINGREGISTRATIE_DECISION_CHAIN: DecisionChainStep[] = [
  {
    step: 1,
    role: 'frontdesk_housing',
    isParallel: false,
    fromStatuses: ['NEW'],
    toStatuses: ['SUBMITTED'],
    description: 'Intake and registration',
  },
  {
    step: 1, // Parallel
    role: 'social_field_worker',
    isParallel: true,
    fromStatuses: ['SUBMITTED'],
    toStatuses: ['IN_SOCIAL_REVIEW', 'SOCIAL_COMPLETED'],
    description: 'Social assessment (parallel)',
  },
  {
    step: 3, // Step 2 skipped (no technical inspection)
    role: 'admin_staff',
    isParallel: false,
    fromStatuses: ['SOCIAL_COMPLETED'],
    toStatuses: ['IN_ADMIN_REVIEW', 'ADMIN_COMPLETE'],
    description: 'Dossier completeness check',
  },
  {
    step: 4,
    role: 'project_leader',
    isParallel: false,
    fromStatuses: ['ADMIN_COMPLETE'],
    toStatuses: ['IN_POLICY_REVIEW', 'POLICY_APPROVED'],
    description: 'Policy compliance review',
  },
  {
    step: 5,
    role: 'director',
    isParallel: false,
    fromStatuses: ['POLICY_APPROVED'],
    toStatuses: ['IN_DIRECTOR_REVIEW', 'REGISTERED', 'REJECTED'],
    description: 'Final decision (Director is final authority for WR)',
  },
];

// ============================================================================
// HELPER FUNCTIONS (FOR DOCUMENTATION ONLY)
// ============================================================================

/**
 * Check if a role is applicable to a service.
 * 
 * STATUS: PREPARED — FOR DOCUMENTATION ONLY
 */
export const isRoleApplicableToService = (
  role: V12AppRole,
  service: 'bouwsubsidie' | 'woningregistratie'
): boolean => {
  const metadata = V12_ROLE_METADATA[role];
  return metadata.serviceApplicability === 'both' 
    || metadata.serviceApplicability === 'technical'
    || metadata.serviceApplicability === service;
};

/**
 * Check if a role is a national (non-district-scoped) role.
 * 
 * STATUS: PREPARED — FOR DOCUMENTATION ONLY
 */
export const isNationalRole = (role: V12AppRole): boolean => {
  return V12_ROLE_METADATA[role].scopeType === 'national';
};

/**
 * Get all roles for a specific service.
 * 
 * STATUS: PREPARED — FOR DOCUMENTATION ONLY
 */
export const getRolesForService = (
  service: 'bouwsubsidie' | 'woningregistratie'
): V12AppRole[] => {
  return Object.values(V12_ROLE_METADATA)
    .filter(meta => isRoleApplicableToService(meta.enumValue, service))
    .map(meta => meta.enumValue);
};

/**
 * Get the decision chain for a service.
 * 
 * STATUS: PREPARED — FOR DOCUMENTATION ONLY
 */
export const getDecisionChain = (
  service: 'bouwsubsidie' | 'woningregistratie'
): DecisionChainStep[] => {
  return service === 'bouwsubsidie' 
    ? BOUWSUBSIDIE_DECISION_CHAIN 
    : WONINGREGISTRATIE_DECISION_CHAIN;
};

// ============================================================================
// GOVERNANCE STATEMENT
// ============================================================================

/**
 * GOVERNANCE STATEMENT
 * 
 * This file contains type definitions for PREPARATION ONLY.
 * 
 * DO NOT IMPORT THIS FILE IN OPERATIONAL CODE.
 * 
 * The current system operates with 7 active roles only.
 * 
 * Activation of prepared roles requires:
 * 1. Database enum extension
 * 2. RLS policy creation
 * 3. UI component updates
 * 4. Explicit authorization from Delroy
 * 
 * STATUS: PREPARED — NOT ACTIVE
 */

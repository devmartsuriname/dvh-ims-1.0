import { MenuItemType } from '@/types/menu'
import type { AppRole } from '@/hooks/useUserRole'

export type MenuItemWithRoles = MenuItemType & {
  allowedRoles?: AppRole[]
  children?: MenuItemWithRoles[]
}

export const MENU_ITEMS: MenuItemWithRoles[] = [
  {
    key: 'menu',
    label: 'MENU...',
    isTitle: true,
  },
  {
    key: 'dashboards',
    label: 'Dashboard',
    icon: 'mingcute:home-3-line',
    url: '/dashboards',
    allowedRoles: ['system_admin', 'minister', 'project_leader', 'frontdesk_bouwsubsidie', 'frontdesk_housing', 'admin_staff', 'audit', 'director', 'ministerial_advisor'],
  },
  {
    key: 'shared-core',
    label: 'SHARED CORE',
    isTitle: true,
  },
  {
    key: 'persons',
    label: 'Persons',
    icon: 'mingcute:user-4-line',
    url: '/persons',
    allowedRoles: ['system_admin', 'minister', 'project_leader', 'frontdesk_bouwsubsidie', 'frontdesk_housing', 'admin_staff', 'audit', 'director', 'ministerial_advisor'],
  },
  {
    key: 'households',
    label: 'Households',
    icon: 'mingcute:home-4-line',
    url: '/households',
    allowedRoles: ['system_admin', 'minister', 'project_leader', 'frontdesk_bouwsubsidie', 'frontdesk_housing', 'admin_staff', 'audit', 'director', 'ministerial_advisor'],
  },
  {
    key: 'bouwsubsidie',
    label: 'BOUWSUBSIDIE',
    isTitle: true,
  },
  {
    key: 'control-queue',
    label: 'Control Queue',
    icon: 'mingcute:task-line',
    url: '/control-queue',
    allowedRoles: ['system_admin', 'minister', 'project_leader', 'frontdesk_bouwsubsidie', 'social_field_worker', 'technical_inspector', 'admin_staff', 'audit', 'director', 'ministerial_advisor'],
  },
  {
    key: 'my-visits',
    label: 'My Visits',
    icon: 'mingcute:location-line',
    url: '/my-visits',
    allowedRoles: ['social_field_worker', 'technical_inspector'],
  },
  {
    key: 'schedule-visits',
    label: 'Schedule Visits',
    icon: 'mingcute:calendar-2-line',
    url: '/schedule-visits',
    allowedRoles: ['admin_staff', 'project_leader', 'system_admin', 'audit'],
  },
  {
    key: 'subsidy-cases',
    label: 'Subsidy Cases',
    icon: 'mingcute:file-check-line',
    url: '/subsidy-cases',
    allowedRoles: ['system_admin', 'minister', 'project_leader', 'frontdesk_bouwsubsidie', 'social_field_worker', 'technical_inspector', 'admin_staff', 'audit', 'director', 'ministerial_advisor'],
  },
  {
    key: 'case-assignments',
    label: 'Case Assignments',
    icon: 'mingcute:user-check-line',
    url: '/case-assignments',
    allowedRoles: ['system_admin', 'project_leader', 'social_field_worker', 'technical_inspector', 'admin_staff', 'director', 'ministerial_advisor', 'minister', 'audit'],
  },
  {
    key: 'woning-registratie',
    label: 'WONING REGISTRATIE',
    isTitle: true,
  },
  {
    key: 'housing-registrations',
    label: 'Registrations',
    icon: 'mingcute:document-line',
    url: '/housing-registrations',
    allowedRoles: ['system_admin', 'minister', 'project_leader', 'frontdesk_housing', 'admin_staff', 'audit'],
  },
  {
    key: 'housing-waiting-list',
    label: 'Waiting List',
    icon: 'mingcute:list-ordered-line',
    url: '/housing-waiting-list',
    allowedRoles: ['system_admin', 'minister', 'project_leader', 'frontdesk_housing', 'admin_staff', 'audit'],
  },
  {
    key: 'allocation-engine',
    label: 'ALLOCATION ENGINE',
    isTitle: true,
  },
  {
    key: 'allocation-quotas',
    label: 'District Quotas',
    icon: 'mingcute:chart-pie-line',
    url: '/allocation-quotas',
    allowedRoles: ['system_admin', 'minister', 'project_leader', 'frontdesk_housing', 'admin_staff', 'audit'],
  },
  {
    key: 'allocation-runs',
    label: 'Allocation Runs',
    icon: 'mingcute:play-circle-line',
    url: '/allocation-runs',
    allowedRoles: ['system_admin', 'project_leader'],
  },
  {
    key: 'allocation-decisions',
    label: 'Decisions',
    icon: 'mingcute:check-2-line',
    url: '/allocation-decisions',
    allowedRoles: ['system_admin', 'minister', 'project_leader', 'frontdesk_housing', 'admin_staff', 'audit'],
  },
  {
    key: 'allocation-assignments',
    label: 'Assignments',
    icon: 'mingcute:transfer-line',
    url: '/allocation-assignments',
    allowedRoles: ['system_admin', 'minister', 'project_leader', 'frontdesk_housing', 'admin_staff', 'audit'],
  },
  {
    key: 'governance',
    label: 'GOVERNANCE',
    isTitle: true,
  },
  {
    key: 'archive',
    label: 'Archive',
    icon: 'mingcute:archive-line',
    url: '/archive',
    allowedRoles: ['system_admin', 'minister', 'project_leader', 'director', 'ministerial_advisor', 'audit'],
  },
  {
    key: 'audit-log',
    label: 'Audit Log',
    icon: 'mingcute:file-security-line',
    url: '/audit-log',
    allowedRoles: ['system_admin', 'minister', 'project_leader', 'audit', 'director', 'ministerial_advisor'],
  },
]

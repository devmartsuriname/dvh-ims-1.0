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
    label: 'dashboard',
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
    key: 'subsidy-cases',
    label: 'Subsidy Cases',
    icon: 'mingcute:file-check-line',
    url: '/subsidy-cases',
    allowedRoles: ['system_admin', 'minister', 'project_leader', 'frontdesk_bouwsubsidie', 'admin_staff', 'audit', 'director', 'ministerial_advisor'],
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
    key: 'audit-log',
    label: 'Audit Log',
    icon: 'mingcute:file-security-line',
    url: '/audit-log',
    allowedRoles: ['system_admin', 'minister', 'project_leader', 'audit', 'director', 'ministerial_advisor'],
  },
]

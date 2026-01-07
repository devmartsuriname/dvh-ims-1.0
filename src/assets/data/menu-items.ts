import { MenuItemType } from '@/types/menu'

export const MENU_ITEMS: MenuItemType[] = [
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
  },
  {
    key: 'households',
    label: 'Households',
    icon: 'mingcute:home-4-line',
    url: '/households',
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
  },
  {
    key: 'housing-waiting-list',
    label: 'Waiting List',
    icon: 'mingcute:list-ordered-line',
    url: '/housing-waiting-list',
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
  },
  {
    key: 'allocation-runs',
    label: 'Allocation Runs',
    icon: 'mingcute:play-circle-line',
    url: '/allocation-runs',
  },
  {
    key: 'allocation-decisions',
    label: 'Decisions',
    icon: 'mingcute:check-2-line',
    url: '/allocation-decisions',
  },
  {
    key: 'allocation-assignments',
    label: 'Assignments',
    icon: 'mingcute:transfer-line',
    url: '/allocation-assignments',
  },
  {
    key: 'auth',
    label: 'Authentication',
    icon: 'mingcute:user-3-line',
    children: [
      {
        key: 'sign-in',
        label: 'Sign In',
        url: '/auth/sign-in',
        parentKey: 'auth',
      },
      {
        key: 'sign-up',
        label: 'Sign Up',
        url: '/auth/sign-up',
        parentKey: 'auth',
      },
      {
        key: 'reset-password',
        label: 'Reset Password',
        url: '/auth/reset-password',
        parentKey: 'auth',
      },
      {
        key: 'lock-screen',
        label: 'Lock Screen',
        url: '/auth/lock-screen',
        parentKey: 'auth',
      },
    ],
  },
]

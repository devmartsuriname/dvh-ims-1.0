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

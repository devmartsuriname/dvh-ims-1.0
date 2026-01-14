/**
 * Unified Notification Helper
 * 
 * Admin v1.1-D D2: Notification Hygiene
 * 
 * Purpose: Single entry point for all admin module notifications.
 * Wraps react-toastify with consistent defaults.
 * 
 * Usage:
 *   import { notify } from '@/utils/notify'
 *   notify.success('Record created successfully')
 *   notify.error('Failed to load data')
 */

import { toast, ToastOptions } from 'react-toastify'

const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
}

export const notify = {
  /**
   * Show success notification
   */
  success: (message: string, options?: ToastOptions) =>
    toast.success(message, { ...defaultOptions, ...options }),

  /**
   * Show error notification
   */
  error: (message: string, options?: ToastOptions) =>
    toast.error(message, { ...defaultOptions, ...options }),

  /**
   * Show info notification
   */
  info: (message: string, options?: ToastOptions) =>
    toast.info(message, { ...defaultOptions, ...options }),

  /**
   * Show warning notification
   */
  warn: (message: string, options?: ToastOptions) =>
    toast.warn(message, { ...defaultOptions, ...options }),
}

export default notify

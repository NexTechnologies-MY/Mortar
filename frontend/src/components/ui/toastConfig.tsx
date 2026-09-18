/**
 * App-wide toast notifier wrapper around `react-hot-toast`.
 *
 * Wraps each toast variant (success / error / warning / info / loading) with
 * project-consistent styling (border colour, icon, duration, position) so the
 * rest of the codebase can call `notify.success('...')` without re-specifying.
 *
 * `notify.success` ALSO pushes a persistent entry into `notificationStore` so
 * successful actions appear in the bell-icon popover. The other variants are
 * transient-only.
 */

import toast from 'react-hot-toast'
import type { ToastOptions } from 'react-hot-toast'
import { CheckCircle, XCircle, AlertTriangle, Info, Loader2 } from 'lucide-react'
import { notificationStore } from '@/lib/notificationStore'

/** Shared visual style applied to every toast variant. */
const BASE_STYLE: React.CSSProperties = {
  background: 'var(--popover)',
  color: 'var(--popover-foreground)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  padding: '12px 16px',
  fontSize: '0.875rem',
  boxShadow: 'var(--shadow-overlay)',
  maxWidth: '420px'
}

/** Default `ToastOptions` reused by every variant. */
const baseOptions: ToastOptions = {
  duration: 2500,
  style: BASE_STYLE,
  position: 'bottom-center'
}

/**
 * App-wide toast facade. Each variant fires a transient `react-hot-toast`
 * notification; `success` additionally records a persistent entry in the
 * notification bell store.
 */
export const notify = {
  success: (message: string) => {
    notificationStore.push('Success', message)
    return toast.success(message, {
      ...baseOptions,
      icon: <CheckCircle className="h-5 w-5 text-status-positive-fg" />,
      style: { ...BASE_STYLE, borderColor: 'var(--status-positive-bg)' }
    })
  },

  error: (message: string) =>
    toast.error(message, {
      ...baseOptions,
      duration: 4000,
      icon: <XCircle className="h-5 w-5 text-status-danger-fg" />,
      style: { ...BASE_STYLE, borderColor: 'var(--status-danger-bg)' }
    }),

  warning: (message: string) =>
    toast(message, {
      ...baseOptions,
      icon: <AlertTriangle className="h-5 w-5 text-status-warning-fg" />,
      style: { ...BASE_STYLE, borderColor: 'var(--status-warning-bg)' }
    }),

  info: (message: string) =>
    toast(message, {
      ...baseOptions,
      icon: <Info className="h-5 w-5 text-status-info-fg" />,
      style: { ...BASE_STYLE, borderColor: 'var(--status-info-bg)' }
    }),

  loading: (message: string) =>
    toast.loading(message, {
      ...baseOptions,
      icon: <Loader2 className="h-5 w-5 animate-spin text-primary" />,
      duration: Infinity
    }),

  dismiss: toast.dismiss
}

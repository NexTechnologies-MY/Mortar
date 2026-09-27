/**
 * In-app notification store.
 *
 * Backs the bell icon in the app header with a localStorage-persisted list
 * (key `mortar.notifications.<profile>`, capped at 50 entries). Components subscribe via
 * `notificationStore.subscribe(listener)` and receive the full list on every
 * mutation; the convenience hook around this lives in
 * `components/ui/NotificationPopover.tsx`.
 */

import { REFERENCE_DATE, simNow } from '@mortar/core'
import type { Notification } from '@/components/ui/NotificationPopover'

let profileId = (() => {
  try {
    return localStorage.getItem('mortar.profile') ?? 'sales-nurul-aina'
  } catch {
    return 'sales-nurul-aina'
  }
})()
const storageKey = () => `mortar.notifications.${profileId}`
let seenTasks = new Set<string>()

/** Hydrates notifications from localStorage; returns `[]` on any parse error. */
function loadNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(storageKey())
    if (!raw) return []
    return JSON.parse(raw) as Notification[]
  } catch {
    return []
  }
}

/** Serialises the notifications list to localStorage. */
function saveNotifications(notifications: Notification[]) {
  try {
    localStorage.setItem(storageKey(), JSON.stringify(notifications))
  } catch {
    /* Storage is optional. */
  }
}

/** Subscriber callback type — receives the full notifications list. */
type Listener = (notifications: Notification[]) => void

let notifications: Notification[] = loadNotifications()
const listeners = new Set<Listener>()

/** Persists to localStorage and broadcasts the latest list to every listener. */
function emit() {
  saveNotifications(notifications)
  for (const listener of listeners) listener(notifications)
}

/**
 * Profile-scoped notification store backed by localStorage, max 50 entries per profile.
 * Subscribers receive the full list on every mutation.
 */
export const notificationStore = {
  setProfile: (id: string) => {
    if (id === profileId) return
    profileId = id
    seenTasks = new Set()
    notifications = loadNotifications()
    emit()
  },
  managerTask: (task: {
    id: string
    title: string
    managerFlaggedBy?: string | null
    bookingId: string
    createdAt: string
  }) => {
    const id = `manager-${task.id}`
    if (seenTasks.has(id) || notifications.some((n) => n.id === id)) return
    seenTasks.add(id)
    notifications = [
      {
        id,
        title: 'Manager Follow-Up',
        description: `${task.managerFlaggedBy}: ${task.title} (${task.bookingId})`,
        timestamp: task.createdAt,
        read: false
      },
      ...notifications
    ].slice(0, 50)
    emit()
  },
  /** Returns the current notifications list (newest first). */
  get: () => notifications,

  /**
   * Prepends a new notification. Truncates to the 50-most-recent so the
   * bell never grows unbounded — older notifications drop off silently.
   */
  push: (title: string, description: string) => {
    notifications = [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title,
        description,
        timestamp: simNow(REFERENCE_DATE),
        read: false
      },
      ...notifications
    ].slice(0, 50) // keep max 50
    emit()
  },

  /** Marks a single notification as read by id. */
  markAsRead: (id: string) => {
    notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    emit()
  },

  /** Removes a single notification by id. */
  dismiss: (id: string) => {
    notifications = notifications.filter((n) => n.id !== id)
    emit()
  },

  /** Removes every notification. */
  clearAll: () => {
    notifications = []
    emit()
  },

  /**
   * Registers a listener and returns an unsubscribe function. The listener
   * is called immediately with the current list and on every subsequent
   * mutation.
   */
  subscribe: (listener: Listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }
}

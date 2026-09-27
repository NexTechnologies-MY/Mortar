import { profileForPersona, DEMO_PROFILES, type StaffProfile } from '@mortar/core'

import { notificationStore } from './notificationStore'

export const PROFILE_STORAGE_KEY = 'mortar.profile'

export function readProfile(): StaffProfile {
  try {
    const id = localStorage.getItem(PROFILE_STORAGE_KEY)
    const found = DEMO_PROFILES.find((profile) => profile.id === id)
    if (found) return found
    const persona = localStorage.getItem('mortar.persona')
    if (persona === 'finance') return profileForPersona('legal-admin')
    if (persona === 'manager' || persona === 'loan-admin' || persona === 'legal-admin')
      return profileForPersona(persona)
  } catch {
    /* Private browsing may disable storage. */
  }
  return profileForPersona('sales-admin')
}

let activeProfile = readProfile()
notificationStore.setProfile(activeProfile.id)
export const activeProfileId = () => activeProfile.id
let established: string | null = null
export const invalidateSession = () => {
  established = null
}
let pending: Promise<void> = Promise.resolve()

export function selectProfile(profile: StaffProfile) {
  notificationStore.setProfile(profile.id)
  activeProfile = profile
  established = null
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, profile.id)
  } catch {
    /* Storage is optional. */
  }
}

/** Serialize profile switches so an old session response cannot replace a newer one. */
export async function ensureSession(): Promise<void> {
  const requested = activeProfile.id
  pending = pending
    .catch(() => {})
    .then(async () => {
      if (requested !== activeProfile.id) throw new Error('Profile changed. Please try again.')
      if (established === requested) return
      const response = await fetch('/api/session', {
        signal: AbortSignal.timeout(20000),
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ profileId: requested })
      })
      if (!response.ok) throw new Error('Could not open this profile. Please try again.')
      if (requested !== activeProfile.id) throw new Error('Profile changed. Please try again.')
      established = requested
    })
  await pending
}

export async function signOut() {
  await pending.catch(() => {})
  established = null
  await fetch('/api/session', { method: 'DELETE' })
}

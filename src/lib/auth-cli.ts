import { getAuth } from '@/lib/auth'

/**
 * Entry point for the Better Auth CLI only (`bun run auth:schema`), which needs
 * a ready-made `auth` export to derive the database schema from. App code
 * imports getAuth() from '@/lib/auth' instead.
 */
export const auth = getAuth()

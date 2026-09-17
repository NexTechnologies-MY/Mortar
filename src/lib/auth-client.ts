'use client'

import { createAuthClient } from 'better-auth/react'

/** Browser-side auth client. Talks to /api/auth on the current origin. */
export const authClient = createAuthClient()

export const { signIn, signUp, signOut, useSession } = authClient

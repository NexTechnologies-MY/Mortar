/**
 * Ball in court, on screen: the words and glyphs for who holds a case, and
 * which of the developer's staff makes each move. The rules themselves live in
 * `ballInCourt` (`@mortar/core`), so the desks and the tests read one source.
 */
import type { LucideIcon } from 'lucide-react'
import { Building2, Landmark, Scale, User } from 'lucide-react'
import type { BallHolder, NextAction, OwnerRole } from '@mortar/core'

export const BALL_HOLDER_LABELS: Record<BallHolder, string> = {
  buyer: 'Buyer',
  bank: 'Bank',
  solicitor: 'Solicitor',
  developer: 'Developer'
}

/** The glyph names who the case waits on, never how late it is (DESIGN.md Icons). */
export const BALL_HOLDER_ICONS: Record<BallHolder, LucideIcon> = {
  buyer: User,
  bank: Landmark,
  solicitor: Scale,
  developer: Building2
}

export const BALL_HOLDERS = Object.keys(BALL_HOLDER_LABELS) as BallHolder[]

/** The desk that makes each move: loan admin chases paperwork and banks, legal the SPA, sales the buyer. */
export const MOVE_OWNER: Record<NextAction, OwnerRole> = {
  request_document: 'loan_admin',
  chase_banker: 'loan_admin',
  submit_another_bank: 'loan_admin',
  call_buyer: 'sales',
  schedule_spa: 'legal',
  escalate_legal: 'legal',
  review_release: 'sales_admin',
  wait: 'loan_admin'
}

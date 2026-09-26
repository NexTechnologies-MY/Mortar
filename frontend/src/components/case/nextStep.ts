/**
 * One next step per case, whichever screen asks.
 *
 * Two engines used to answer the same question: the chase card raised Jev's
 * suggested action, while Waiting On and the table's Task column raised the
 * rule-based move from `ballInCourt`. One booking could end up with two open
 * tasks for two different people.
 *
 * This module picks the rule-based move as the default — it is the answer the
 * app can always produce, from the same summary the stall rules read — and
 * keeps Jev's action as an alternative only when the two actually differ. The
 * rules in `@mortar/core` are untouched; this only decides which one leads and
 * what a button raises when a person picks the other.
 */

import { ballInCourt } from '@mortar/core'
import type {
  Booking,
  CaseSummary,
  DocumentKind,
  NextAction,
  NextActionSuggestion,
  OwnerRole,
  Task
} from '@mortar/core'
import { MOVE_OWNER } from '@/components/case/ball'
import { addDays, ownerName, taskTitle } from '@/components/chase/chase'

/** One step a person can take, and who on the developer's side takes it. */
export type NextStep = {
  action: NextAction
  label: string
  ownerRole: OwnerRole
  /** The document the step refers to, when one is outstanding or proposed. */
  document?: DocumentKind
}

/** A case's next step, plus the alternative only where Jev disagrees. */
export type CaseNextStep = {
  /** The rule-based move, and the one every screen leads with. */
  defaultStep: NextStep
  /** Jev's move, present only when it differs from the default. */
  alternativeStep?: NextStep
  /** `true` when nobody owes a move: the SPA is signed or the booking closed. */
  waitingOnNobody: boolean
}

function stepFor(action: NextAction, label: string, booking: Booking, document?: DocumentKind): NextStep {
  return { action, label, ownerRole: MOVE_OWNER[action], document }
}

/**
 * The step a case is on, and the alternative Jev proposes when it disagrees.
 *
 * With no suggestion, or with one that names the same move, there is no
 * alternative: the caller shows one step and one button, so the same click on
 * any screen raises the same task.
 */
export function nextStepFor(
  booking: Booking,
  summary: CaseSummary,
  labels: Record<NextAction, string>,
  suggestion?: NextActionSuggestion
): CaseNextStep {
  const ball = ballInCourt(summary)
  const document = summary.outstandingDocuments[0]
  if (ball.nextMove === null) {
    return {
      defaultStep: stepFor('wait', labels.wait, booking, document),
      alternativeStep: jevStep(booking, suggestion, document, labels),
      waitingOnNobody: true
    }
  }

  const defaultStep = stepFor(ball.nextMove, labels[ball.nextMove], booking, document)
  const alternativeStep = jevStep(booking, suggestion, document, labels)
  return {
    defaultStep,
    alternativeStep: alternativeStep?.action === defaultStep.action ? undefined : alternativeStep,
    waitingOnNobody: false
  }
}

/** Jev's move, when it is one a person can act on. */
function jevStep(
  booking: Booking,
  suggestion: NextActionSuggestion | undefined,
  document: DocumentKind | undefined,
  labels: Record<NextAction, string>
): NextStep | undefined {
  if (!suggestion) return undefined
  const action = suggestion.action.value
  return stepFor(action, labels[action], booking, document)
}

/**
 * The task payload a step raises. One builder for every screen, so Create Task
 * on a card, Add Task in Waiting On and Add Task in the table all post the
 * same shape for the same step.
 *
 * `origin` is `jev` only when the step came from Jev and he was the one who
 * worked it out, so a person does not see a suggestion in their name.
 */
export function stepToTask(
  step: NextStep,
  booking: Booking,
  referenceDate: string,
  options?: { daysUntilDue?: number; origin?: Task['origin'] }
): CreateTaskPayload {
  return {
    bookingId: booking.id,
    action: step.action,
    title: taskTitle(step.action, booking, step.document),
    ownerRole: step.ownerRole,
    ownerName: ownerName(step.ownerRole, booking),
    dueOn: addDays(referenceDate, options?.daysUntilDue ?? 2),
    origin: options?.origin ?? 'staff'
  }
}

/** The `POST /api/tasks` body, named so callers do not spell it out twice. */
export type CreateTaskPayload = {
  bookingId: string
  action: NextAction
  title: string
  ownerRole: OwnerRole
  ownerName: string
  dueOn: string
  origin: Task['origin']
}

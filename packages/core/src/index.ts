/**
 * The `@mortar/core` surface: the domain contract, the seeded simulation and
 * case rules, who holds the ball on a case, booking sheet intake, the Jev
 * helpers, the Ask question set, and the demo fixtures.
 * Resolves straight to source — there is no build step.
 */
export type * from './types'
export * from './sim'
export * from './ball'
export * from './import'
export * from './jev'
export * from './brain'
export { STORIES } from './fixtures/stories'
export { PLAYBOOKS } from './fixtures/playbooks'

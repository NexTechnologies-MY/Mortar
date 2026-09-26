/**
 * Vitest setup for every frontend test.
 *
 * Radix marks the rest of the document `aria-hidden` when a tooltip, popover or
 * dialog opens. React reads that back through `getComputedStyle`, and jsdom
 * resolves each stylesheet rule through nwsapi, whose `:fullscreen` and
 * `:modal` resolvers call `Element.matches`, the method nwsapi has already
 * patched, so every rule re-enters its own engine. One open tooltip cost tens
 * of millions of calls and 20 seconds of CPU, which timed tests out and starved
 * Vitest's worker RPC ("Timeout calling onTaskUpdate"). jsdom has no fullscreen
 * or modal state, so the honest answer to both is no.
 */
const matches = Element.prototype.matches
Element.prototype.matches = function (this: Element, selector: string) {
  if (selector === ':fullscreen' || selector === ':modal') return false
  return matches.call(this, selector)
}

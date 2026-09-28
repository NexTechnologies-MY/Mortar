/**
 * Opens Ask MortarAI from anywhere with a question already sent.
 *
 * The panel lives in the top bar (`AskTrigger`), far from the page that wants
 * to ask, so a page dispatches one window event instead of threading a
 * callback through the shell. The trigger opens the panel and the panel sends
 * the question once its context is ready.
 */

export const ASK_EVENT = 'mortar:ask'

export type AskRequest = { question: string }

export function askMortarAI(question: string) {
  window.dispatchEvent(new CustomEvent<AskRequest>(ASK_EVENT, { detail: { question } }))
}

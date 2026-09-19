/**
 * Jev helpers shared by the server and the browser (lane W3).
 * Signatures are part of the contract; the bodies below are placeholders.
 */
import type { CaseEvent, CaseSummary, Extraction, Message, Playbook } from './types'

/** Keyword search over playbooks, including Malay and Manglish synonyms in `tags`. */
export function searchPlaybooks(
  playbooks: Playbook[],
  query: string,
  limit = 10
): { playbook: Playbook; keywordScore: number }[] {
  return notBuilt('searchPlaybooks', [playbooks, query, limit])
}

/** Turn an extraction into a provisional event for staff review; `null` for `no_update`. */
export function proposalFromExtraction(
  extraction: Extraction,
  message: Message,
  summary: CaseSummary
): Omit<CaseEvent, 'id' | 'recordedAt'> | null {
  return notBuilt('proposalFromExtraction', [extraction, message, summary])
}

function notBuilt(name: string, input: unknown): never {
  throw new Error(`@mortar/core ${name} is not built yet (${typeof input} input)`)
}

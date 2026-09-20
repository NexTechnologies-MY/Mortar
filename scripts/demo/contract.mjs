export const REQUIRED_BEATS = [
  'chase_queue',
  'chase_task',
  'case_overview',
  'case_risk',
  'banker_message',
  'doc_pending',
  'buyer_reply',
  'case_cleared',
  'playbooks',
  'stale_unknown',
  'legal_persona',
  'forecast',
  'end'
]

export function auditCapture(beats, filmed) {
  const observed = beats.map(({ name }) => name)
  const missing = REQUIRED_BEATS.filter((name) => filmed[name] !== 1 || !observed.includes(name))
  const ordered =
    observed.length === REQUIRED_BEATS.length && observed.every((name, index) => name === REQUIRED_BEATS[index])
  return { complete: missing.length === 0 && ordered, missing, observed, ordered }
}

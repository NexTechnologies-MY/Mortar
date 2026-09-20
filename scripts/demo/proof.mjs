// Proofs the demo relies on, asked of the deployment rather than assumed.
// verifyCleanSeed guards the recording: the walk mutates BK-9001, so capture
// must start from the canonical reset or the footage shows a dirtied case.

const SEEDED_MESSAGES = 27
const BK = 'BK-9001'
const BK_MESSAGES = ['MSG-9001-1', 'MSG-9001-2', 'MSG-9001-3', 'MSG-9001-4']

/** Reads /api/snapshot and reports whether it is the untouched seed. */
export async function verifyCleanSeed(web, { fetchImpl = fetch } = {}) {
  const problems = []
  let snapshot
  try {
    const res = await fetchImpl(`${web}/api/snapshot`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    snapshot = await res.json()
  } catch (e) {
    return { clean: false, problems: [`snapshot unreachable: ${String(e).slice(0, 120)}`] }
  }

  const messages = snapshot.messages ?? []
  const events = snapshot.events ?? []
  const tasks = snapshot.tasks ?? []

  if (messages.length !== SEEDED_MESSAGES) {
    problems.push(`expected ${SEEDED_MESSAGES} seeded messages, found ${messages.length}`)
  }
  if (tasks.length !== 0) {
    problems.push(`expected no tasks, found ${tasks.length}`)
  }

  const bkMessages = messages.filter((m) => m.bookingId === BK).map((m) => m.id)
  for (const id of BK_MESSAGES) {
    if (!bkMessages.includes(id)) problems.push(`missing fixture message ${id}`)
  }
  if (bkMessages.length !== BK_MESSAGES.length) {
    problems.push(`expected ${BK_MESSAGES.length} messages on ${BK}, found ${bkMessages.length}`)
  }

  const bkEvents = events.filter((e) => e.bookingId === BK)
  const proposals = bkEvents.filter(
    (e) => e.kind === 'documents_requested' && e.document === 'payslip' && e.status === 'provisional'
  )
  if (proposals.length !== 1) {
    problems.push(`expected one provisional payslip proposal on ${BK}, found ${proposals.length}`)
  }
  if (bkEvents.some((e) => e.kind === 'documents_received')) {
    problems.push(`${BK} already has a documents_received event`)
  }
  if (bkEvents.some((e) => e.status === 'confirmed' && e.source === 'jev')) {
    problems.push(`${BK} already has a confirmed Jev event`)
  }

  return { clean: problems.length === 0, problems }
}

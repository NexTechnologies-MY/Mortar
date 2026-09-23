/**
 * Record An Update — staff record what happened on a case by hand ("loan
 * approved", "SPA signed") and move it on without waiting for a message for
 * Jev to read. The update is confirmed as it is saved, so the stage, Waiting
 * On, the bank list and the Chase List all move as soon as the snapshot
 * refreshes.
 *
 * - Submitted To A Bank creates the bank application together with its
 *   submission (`POST /api/applications`); every other update is one event
 *   (`POST /api/events`).
 * - A bank's decision names the application it decides, so the right bank
 *   shows approved or rejected.
 * - SPA Appointment Set writes its note as `Appointment On YYYY-MM-DD`, the
 *   form the Legal desk reads the appointment date from.
 * - Closing the case (Cancelled, Lapsed) or recording a withdrawal asks first
 *   in a dialog, Cancel focused.
 */

import { useRef, useState } from 'react'
import type {
  ApplicationStatus,
  Booking,
  CaseSummary,
  DocumentKind,
  EventKind,
  LoanApplication,
  Track
} from '@mortar/core'
import { postApplication, postEvent } from '@/lib/api'
import { notify } from '@/components/ui/toastConfig'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { APPLICATION_STATUS_LABELS, DOCUMENT_LABELS } from './labels'
import { DateField } from './DateField'

/** What staff can record by hand; `booked` is written by the import alone. */
type UpdateKind = Exclude<EventKind, 'booked'>

const GROUPS: { track: Track; label: string; kinds: [UpdateKind, string][] }[] = [
  {
    track: 'sales',
    label: 'Sales',
    kinds: [
      ['buyer_contacted', 'Buyer Contacted'],
      ['buyer_hesitant', 'Buyer Hesitant'],
      ['buyer_withdrew', 'Buyer Withdrew'],
      ['cancelled', 'Cancelled'],
      ['lapsed', 'Lapsed']
    ]
  },
  {
    track: 'loan',
    label: 'Loan',
    kinds: [
      ['loan_submitted', 'Submitted To A Bank'],
      ['documents_requested', 'Documents Requested'],
      ['documents_received', 'Documents Received'],
      ['valuation_shortfall', 'Valuation Shortfall'],
      ['loan_approved', 'Loan Approved (LO Issued)'],
      ['loan_rejected', 'Loan Rejected'],
      ['loan_agreement_signed', 'Loan Agreement Signed'],
      ['disbursed', 'Disbursed']
    ]
  },
  {
    track: 'legal',
    label: 'Legal',
    kinds: [
      ['spa_appointment_set', 'SPA Appointment Set'],
      ['spa_signed', 'SPA Signed']
    ]
  }
]

const TRACK_OF = Object.fromEntries(GROUPS.flatMap((g) => g.kinds.map(([kind]) => [kind, g.track]))) as Record<
  UpdateKind,
  Track
>
const LABEL_OF = Object.fromEntries(GROUPS.flatMap((g) => g.kinds)) as Record<UpdateKind, string>

/** Updates that must say which bank; a decision without its application cannot mark it. */
const BANK_REQUIRED: ReadonlySet<UpdateKind> = new Set(['loan_approved', 'loan_rejected', 'valuation_shortfall'])
/** Updates that may say which bank: a document can be asked for before any submission. */
const BANK_OPTIONAL: ReadonlySet<UpdateKind> = new Set(['documents_requested', 'documents_received'])
/** A bank decides an application once; a second decision on it would change nothing. */
const DECISIONS: ReadonlySet<UpdateKind> = new Set(['loan_approved', 'loan_rejected'])
const DECIDED: ReadonlySet<ApplicationStatus> = new Set(['approved', 'rejected'])
const STILL_OPEN: ReadonlySet<ApplicationStatus> = new Set(['submitted', 'documents_pending'])

const DOCUMENTS = Object.keys(DOCUMENT_LABELS) as DocumentKind[]
/** Select value for a documents update that is not tied to one bank. */
const NO_BANK = 'none'
/** Select value for documents received that clear everything outstanding. */
const ALL_DOCUMENTS = 'all'

/** Updates that close or end the case: each asks before it is recorded. */
const CONFIRM: Partial<Record<UpdateKind, { title: string; description: string; action: string }>> = {
  cancelled: {
    title: 'Record This Booking As Cancelled?',
    description:
      'The case closes: it leaves the Chase List and the forecast, its unit can be booked again, and this page stops taking updates. This cannot be undone from the case page.',
    action: 'Record Cancellation'
  },
  lapsed: {
    title: 'Record This Booking As Lapsed?',
    description:
      'The case closes: it leaves the Chase List and the forecast, its unit can be booked again, and this page stops taking updates. This cannot be undone from the case page.',
    action: 'Record Lapse'
  },
  buyer_withdrew: {
    title: 'Record That The Buyer Withdrew?',
    description:
      'Any bank application still waiting is marked withdrawn, and Waiting On moves to a decision to release the unit. This cannot be undone from the case page.',
    action: 'Record Withdrawal'
  }
}

const EYEBROW = 'text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground'

export function RecordUpdateForm({
  booking,
  applications,
  summary,
  referenceDate,
  reportedBy,
  onRecorded
}: {
  booking: Booking
  /** This booking's bank applications. */
  applications: LoanApplication[]
  /** The case as derived now; gives each application its status. */
  summary: CaseSummary
  /** The desks' today: the default day, and the latest one an update can carry. */
  referenceDate: string
  /** The staff name the update is recorded under. */
  reportedBy: string
  /** Re-reads the case once the update is saved. */
  onRecorded: () => Promise<void>
}) {
  const [kind, setKind] = useState<UpdateKind | ''>('')
  const [applicationId, setApplicationId] = useState('')
  const [bank, setBank] = useState('')
  const [banker, setBanker] = useState('')
  const [documentKind, setDocumentKind] = useState('')
  const [appointmentOn, setAppointmentOn] = useState('')
  const [occurredOn, setOccurredOn] = useState(referenceDate)
  const [note, setNote] = useState('')
  const [pending, setPending] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)

  const statusOf = new Map(summary.applications.map((a) => [a.id, a.status]))
  const status = (app: LoanApplication): ApplicationStatus => statusOf.get(app.id) ?? 'submitted'
  const bankRequired = kind !== '' && BANK_REQUIRED.has(kind)
  const bankOptional = kind !== '' && BANK_OPTIONAL.has(kind)
  const takesDocument = bankOptional
  const decision = kind !== '' && DECISIONS.has(kind)
  const confirmation = kind === '' ? undefined : CONFIRM[kind]

  const choose = (next: UpdateKind) => {
    setKind(next)
    setDocumentKind('')
    setAppointmentOn('')
    setBank('')
    setBanker('')
    // One application still with a bank is the one meant; otherwise the reader picks.
    const open = applications.filter((a) => STILL_OPEN.has(status(a)))
    if (BANK_REQUIRED.has(next)) setApplicationId(open.length === 1 ? open[0].id : '')
    else if (BANK_OPTIONAL.has(next)) setApplicationId(open.length === 1 ? open[0].id : NO_BANK)
    else setApplicationId('')
  }

  const reset = () => {
    setKind('')
    setApplicationId('')
    setBank('')
    setBanker('')
    setDocumentKind('')
    setAppointmentOn('')
    setOccurredOn(referenceDate)
    setNote('')
  }

  const missing =
    kind === '' ||
    !occurredOn ||
    (kind === 'loan_submitted' && (!bank.trim() || !banker.trim())) ||
    (bankRequired && !applicationId) ||
    (takesDocument && !documentKind) ||
    (kind === 'spa_appointment_set' && !appointmentOn)

  const save = async () => {
    if (kind === '' || missing) return
    setPending(true)
    const extra = note.trim()
    try {
      if (kind === 'loan_submitted') {
        await postApplication({
          bookingId: booking.id,
          bank: bank.trim(),
          banker: banker.trim(),
          occurredOn,
          note: extra || undefined,
          reportedBy
        })
        notify.success(`Recorded: ${LABEL_OF[kind]}, ${bank.trim()}.`)
      } else {
        const application = applications.find((a) => a.id === applicationId)
        const written = kind === 'spa_appointment_set' ? [`Appointment On ${appointmentOn}`, extra] : [extra]
        await postEvent({
          bookingId: booking.id,
          track: TRACK_OF[kind],
          kind,
          applicationId: (bankRequired || bankOptional) && application ? application.id : undefined,
          document: takesDocument
            ? documentKind === ALL_DOCUMENTS
              ? null
              : (documentKind as DocumentKind)
            : undefined,
          occurredOn,
          note: written.filter(Boolean).join(' · ') || undefined,
          reportedBy
        })
        notify.success(`Recorded: ${LABEL_OF[kind]}${application ? `, ${application.bank}` : ''}.`)
      }
      setConfirming(false)
      reset()
      await onRecorded()
    } catch {
      setConfirming(false)
      notify.error('Could not record the update. Try again.')
    } finally {
      setPending(false)
    }
  }

  const record = () => {
    if (missing || pending) return
    if (confirmation) setConfirming(true)
    else void save()
  }

  return (
    <section aria-labelledby="record-update-heading" className="flex flex-col gap-3 border-t border-border pt-4">
      <h2 id="record-update-heading" className={EYEBROW}>
        Record An Update
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="record-update-kind">What Happened</Label>
          <Select value={kind} onValueChange={(next) => choose(next as UpdateKind)}>
            <SelectTrigger id="record-update-kind" className="w-full">
              <SelectValue placeholder="Choose What Happened" />
            </SelectTrigger>
            <SelectContent>
              {GROUPS.map((group, i) => (
                <SelectGroup key={group.track}>
                  {i > 0 && <SelectSeparator />}
                  <SelectLabel>{group.label}</SelectLabel>
                  {group.kinds.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="record-update-when">When It Happened</Label>
          <DateField
            id="record-update-when"
            label="When It Happened"
            value={occurredOn}
            onChange={setOccurredOn}
            min={booking.bookingDate}
            max={referenceDate}
            today={referenceDate}
          />
        </div>
      </div>

      {kind === 'loan_submitted' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="record-update-bank-name">Bank</Label>
            <Input
              id="record-update-bank-name"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              placeholder="e.g. Apex Bank"
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="record-update-banker">Banker</Label>
            <Input
              id="record-update-banker"
              value={banker}
              onChange={(e) => setBanker(e.target.value)}
              placeholder="Who handles it at the bank"
              autoComplete="off"
            />
          </div>
        </div>
      )}

      {(bankRequired || (bankOptional && applications.length > 0) || takesDocument) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {bankRequired && applications.length === 0 ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium leading-none">Which Bank</span>
              <p className="flex h-9 items-center text-sm text-muted-foreground">Record Submitted To A Bank First</p>
            </div>
          ) : bankRequired || (bankOptional && applications.length > 0) ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="record-update-application">Which Bank</Label>
              <Select value={applicationId} onValueChange={setApplicationId}>
                <SelectTrigger id="record-update-application" className="w-full">
                  <SelectValue placeholder="Choose The Bank" />
                </SelectTrigger>
                <SelectContent>
                  {bankOptional && <SelectItem value={NO_BANK}>Not For One Bank</SelectItem>}
                  {applications.map((app) => (
                    <SelectItem key={app.id} value={app.id} disabled={decision && DECIDED.has(status(app))}>
                      <span>{app.bank}</span>
                      <span className="text-muted-foreground">{`· ${APPLICATION_STATUS_LABELS[status(app)]}`}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          {takesDocument && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="record-update-document">Document</Label>
              <Select value={documentKind} onValueChange={setDocumentKind}>
                <SelectTrigger id="record-update-document" className="w-full">
                  <SelectValue placeholder="Choose The Document" />
                </SelectTrigger>
                <SelectContent>
                  {kind === 'documents_received' && (
                    <SelectItem value={ALL_DOCUMENTS}>All Outstanding Documents</SelectItem>
                  )}
                  {DOCUMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {DOCUMENT_LABELS[d]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {kind === 'spa_appointment_set' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="record-update-appointment">Appointment Date</Label>
            <DateField
              id="record-update-appointment"
              label="Appointment Date"
              value={appointmentOn}
              onChange={setAppointmentOn}
              min={booking.bookingDate}
              today={referenceDate}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="record-update-note">Note</Label>
        <Input
          id="record-update-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional — what the bank, buyer or solicitor said"
          autoComplete="off"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" variant="secondary" disabled={missing || pending} onClick={record}>
          {pending ? 'Recording…' : 'Record Update'}
        </Button>
        <span className="text-[13px] text-muted-foreground">Recorded As {reportedBy}</span>
      </div>

      <Dialog
        open={confirming}
        onOpenChange={(open) => {
          if (!pending) setConfirming(open)
        }}
      >
        {confirmation && (
          <DialogContent
            onOpenAutoFocus={(e) => {
              e.preventDefault()
              cancelRef.current?.focus()
            }}
          >
            <DialogHeader>
              <DialogTitle>{confirmation.title}</DialogTitle>
              <DialogDescription>{confirmation.description}</DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button ref={cancelRef} type="button" variant="secondary" disabled={pending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="button" variant="destructive" disabled={pending} onClick={() => void save()}>
                {pending ? 'Recording…' : confirmation.action}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </section>
  )
}

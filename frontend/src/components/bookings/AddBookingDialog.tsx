/**
 * Add Booking (issue #24) — a hand-entry form for one booking, opened from
 * the Bookings page. It validates exactly the way a spreadsheet import does:
 * the fields become a two-row sheet (a header row plus the one data row) run
 * through `readBookingSheet` with the same defaults and held-unit map
 * `ImportPage` uses, so a booking that would be refused on import — a unit
 * already held included — is refused here too, with the same messages.
 * Submits through the same `importBookings` endpoint as a one-row batch, so
 * the server's own check runs a second time before anything is stored.
 */

import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarIcon } from 'lucide-react'
import {
  PERSONA_STAFF,
  readBookingSheet,
  SHEET_FIELD_LABELS,
  type Booking,
  type Persona,
  type SheetCell,
  type SheetDefaults,
  type SheetField
} from '@mortar/core'
import { importBookings } from '@/lib/api'
import { formatDate } from '@/components/case/format'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { notify } from '@/components/ui/toastConfig'
import { cn } from '@/lib/utils'

/** The sheet fields the form captures, in the order they become sheet columns. Project and Age are left out: Project takes the desk default, Age comes from the IC. */
const FORM_FIELDS: readonly SheetField[] = [
  'unit',
  'buyerName',
  'ic',
  'phone',
  'priceRm',
  'bookingDate',
  'grossMonthlyIncomeRm',
  'monthlyCommitmentsRm',
  'propertiesOwned',
  'salesOwner',
  'legalFirm'
] as const

interface FormState {
  unit: string
  buyerName: string
  ic: string
  phone: string
  priceRm: string
  bookingDate: Date | undefined
  grossMonthlyIncomeRm: string
  monthlyCommitmentsRm: string
  propertiesOwned: string
  salesOwner: string
  legalFirm: string
}

const EMPTY_FORM: FormState = {
  unit: '',
  buyerName: '',
  ic: '',
  phone: '',
  priceRm: '',
  bookingDate: undefined,
  grossMonthlyIncomeRm: '',
  monthlyCommitmentsRm: '',
  propertiesOwned: '',
  salesOwner: '',
  legalFirm: ''
}

const pad = (n: number) => String(n).padStart(2, '0')

/** The picked day as `YYYY-MM-DD` from its local calendar fields, so the browser's time zone never shifts it. */
function localIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function Field({
  id,
  label,
  required,
  children
}: {
  id: string
  label: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-status-danger-fg"> *</span> : null}
      </Label>
      {children}
    </div>
  )
}

export function AddBookingDialog({
  open,
  onOpenChange,
  referenceDate,
  defaults,
  held,
  persona,
  onImported
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The desks' today; a booking dated after it is refused, exactly as on import. */
  referenceDate: string
  defaults: SheetDefaults | null
  /** Units an open booking already holds, keyed by `unitKey`; the same map `ImportPage` builds. */
  held: ReadonlyMap<string, string>
  persona: Persona
  /** Runs after a successful add: refresh the snapshot, then this dialog navigates to the new case. */
  onImported: () => Promise<void>
}) {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  // Controlled so a pick also closes the popover; left open, its own focus
  // trap can still be live when Submit unmounts the dialog on navigation.
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setServerError(null)
  }
  const touch = () => setTouched(true)

  const bookingDateIso = form.bookingDate ? localIsoDate(form.bookingDate) : null

  // The picker opens on the desks' today, not the browser's, and never lets a
  // future-relative-to-the-desk date be picked — the same limit `readBookingSheet` enforces.
  const referenceDateObj = useMemo(
    () => (referenceDate ? new Date(`${referenceDate}T00:00:00Z`) : undefined),
    [referenceDate]
  )

  const cells = useMemo<SheetCell[][]>(() => {
    const header = FORM_FIELDS.map((f) => SHEET_FIELD_LABELS[f])
    const values: Record<SheetField, SheetCell> = {
      unit: form.unit,
      buyerName: form.buyerName,
      ic: form.ic,
      phone: form.phone,
      priceRm: form.priceRm,
      bookingDate: bookingDateIso ?? '',
      grossMonthlyIncomeRm: form.grossMonthlyIncomeRm,
      monthlyCommitmentsRm: form.monthlyCommitmentsRm,
      propertiesOwned: form.propertiesOwned,
      age: '',
      project: '',
      salesOwner: form.salesOwner,
      legalFirm: form.legalFirm
    }
    return [header, FORM_FIELDS.map((f) => values[f])]
  }, [form, bookingDateIso])

  const sheet = useMemo(
    () => (defaults ? readBookingSheet(cells, { referenceDate, defaults, held }) : null),
    [cells, defaults, referenceDate, held]
  )
  const row = sheet?.rows[0] ?? null
  const errors = row?.errors ?? []
  const warnings = row?.warnings ?? []
  const ready = row?.draft ?? null

  const reset = () => {
    setForm(EMPTY_FORM)
    setTouched(false)
    setServerError(null)
  }

  const close = () => {
    onOpenChange(false)
    reset()
  }

  const submit = async () => {
    setTouched(true)
    setServerError(null)
    if (!ready) return
    setSubmitting(true)
    try {
      const result = await importBookings({
        bookings: [ready],
        reportedBy: PERSONA_STAFF[persona].name,
        source: 'Entered By Hand'
      })
      const created: Booking | undefined = result.bookings[0]
      notify.success(created ? `Booking ${created.id} added.` : 'Booking added.')
      await onImported()
      close()
      if (created) navigate(`/bookings/${created.id}`)
    } catch (e) {
      setServerError(e instanceof Error ? e.message : 'Could Not Add The Booking. Try Again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Booking</DialogTitle>
          <DialogDescription>
            Enter One Booking By Hand. It Is Checked The Same Way A Row On The Import Sheet Is.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field id="add-booking-unit" label="Unit" required>
            <Input
              id="add-booking-unit"
              value={form.unit}
              placeholder="D-05-01"
              onChange={(e) => set('unit', e.target.value)}
              onBlur={touch}
            />
          </Field>
          <Field id="add-booking-buyer-name" label="Buyer Name" required>
            <Input
              id="add-booking-buyer-name"
              value={form.buyerName}
              onChange={(e) => set('buyerName', e.target.value)}
              onBlur={touch}
            />
          </Field>
          <Field id="add-booking-ic" label="IC" required>
            <Input
              id="add-booking-ic"
              value={form.ic}
              placeholder="920311-00-0001"
              onChange={(e) => set('ic', e.target.value)}
              onBlur={touch}
            />
          </Field>
          <Field id="add-booking-phone" label="Phone" required>
            <Input
              id="add-booking-phone"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              onBlur={touch}
            />
          </Field>
          <Field id="add-booking-price" label="Price (RM)" required>
            <Input
              id="add-booking-price"
              inputMode="decimal"
              value={form.priceRm}
              onChange={(e) => set('priceRm', e.target.value)}
              onBlur={touch}
            />
          </Field>
          <Field id="add-booking-date" label="Booking Date" required>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="add-booking-date"
                  type="button"
                  variant="secondary"
                  onBlur={touch}
                  className={cn('w-full justify-start font-normal', !form.bookingDate && 'text-muted-foreground')}
                >
                  <CalendarIcon aria-hidden="true" />
                  {bookingDateIso ? formatDate(bookingDateIso) : 'Pick A Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.bookingDate}
                  defaultMonth={referenceDateObj}
                  disabled={referenceDateObj ? { after: referenceDateObj } : undefined}
                  onSelect={(date) => {
                    set('bookingDate', date)
                    touch()
                    setDatePickerOpen(false)
                  }}
                />
              </PopoverContent>
            </Popover>
          </Field>
          <Field id="add-booking-income" label="Gross Monthly Income (RM)" required>
            <Input
              id="add-booking-income"
              inputMode="decimal"
              value={form.grossMonthlyIncomeRm}
              onChange={(e) => set('grossMonthlyIncomeRm', e.target.value)}
              onBlur={touch}
            />
          </Field>
          <Field id="add-booking-commitments" label="Monthly Commitments (RM)">
            <Input
              id="add-booking-commitments"
              inputMode="decimal"
              value={form.monthlyCommitmentsRm}
              onChange={(e) => set('monthlyCommitmentsRm', e.target.value)}
            />
          </Field>
          <Field id="add-booking-properties" label="Properties Owned">
            <Input
              id="add-booking-properties"
              inputMode="numeric"
              value={form.propertiesOwned}
              onChange={(e) => set('propertiesOwned', e.target.value)}
            />
          </Field>
          <Field id="add-booking-sales-agent" label="Sales Agent">
            <Input
              id="add-booking-sales-agent"
              value={form.salesOwner}
              onChange={(e) => set('salesOwner', e.target.value)}
            />
          </Field>
          <Field id="add-booking-solicitor" label="Solicitor">
            <Input
              id="add-booking-solicitor"
              value={form.legalFirm}
              onChange={(e) => set('legalFirm', e.target.value)}
            />
          </Field>
        </div>

        {serverError ? <p className="text-[13px] text-status-danger-fg">{serverError}</p> : null}

        {touched && errors.length > 0 ? (
          <ul className="flex flex-col gap-1 rounded-md border border-status-danger bg-status-danger-bg p-3">
            {errors.map((e) => (
              <li key={e} className="text-[13px] text-status-danger-fg">
                {e}
              </li>
            ))}
          </ul>
        ) : null}
        {touched && warnings.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {warnings.map((w) => (
              <li key={w} className="text-[13px] text-muted-foreground">
                {w}
              </li>
            ))}
          </ul>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={close} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void submit()} disabled={submitting}>
            {submitting ? 'Adding…' : 'Add Booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

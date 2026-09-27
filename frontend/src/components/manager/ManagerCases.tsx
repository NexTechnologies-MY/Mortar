import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { managerSuggestions, type Booking, type CaseSummary, type OwnerRole } from '@mortar/core'
import { useCases, useSnapshot } from '@/lib/data'
import { usePersona } from '@/lib/persona'
import { postTask } from '@/lib/api'
import { nextStepFor, stepToTask } from '@/components/case/nextStep'
import { NEXT_ACTION_LABELS } from '@/components/chase/chase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { notify } from '@/components/ui/toastConfig'

function ManagerCase({
  booking,
  summary,
  explanation
}: {
  booking: Booking
  summary: CaseSummary
  explanation: string
}) {
  const { snapshot, refresh } = useSnapshot()
  const { profile } = usePersona()
  const step = nextStepFor(booking, summary, NEXT_ACTION_LABELS).defaultStep
  const [department, setDepartment] = useState<OwnerRole>(step.ownerRole === 'sales' ? 'sales_admin' : step.ownerRole)
  const [saving, setSaving] = useState(false)
  const owner =
    department === 'sales_admin'
      ? booking.salesOwner
      : department === 'loan_admin'
        ? booking.loanOwner
        : booking.legalFirm
  const existing = snapshot?.tasks.find(
    (t) =>
      t.bookingId === booking.id &&
      t.status === 'open' &&
      t.managerFlaggedBy &&
      t.ownerRole === department &&
      t.action === step.action
  )
  const create = async () => {
    if (!snapshot || saving || existing) return
    setSaving(true)
    try {
      await postTask({
        ...stepToTask(step, booking, snapshot.meta.referenceDate, { daysUntilDue: 0 }),
        ownerRole: department,
        ownerName: owner,
        managerFlaggedBy: profile.name
      })
      notify.success(`Manager task sent to ${owner}.`)
      await refresh()
    } catch (e) {
      notify.error(e instanceof Error ? e.message : 'Could not create the task.')
    } finally {
      setSaving(false)
    }
  }
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <Link to={`/bookings/${booking.id}`} className="font-medium underline-offset-4 hover:underline">
          {booking.unit} · {booking.buyer.name}
        </Link>
        <p className="text-sm text-muted-foreground">{explanation}</p>
        <p className="text-sm">{step.label}</p>
        <Select value={department} onValueChange={(value) => setDepartment(value as OwnerRole)}>
          <SelectTrigger aria-label={`Assign department for ${booking.id}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sales_admin">Sales Admin</SelectItem>
            <SelectItem value="loan_admin">Loan Admin</SelectItem>
            <SelectItem value="legal">Legal Admin</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Assigned To {owner}</p>
        <Button variant="secondary" disabled={saving || !!existing} onClick={() => void create()}>
          {existing ? 'Manager Task Open' : saving ? 'Creating Task…' : 'Create Manager Task'}
        </Button>
      </CardContent>
    </Card>
  )
}

export function ManagerCases({ suggestionsOnly = false }: { suggestionsOnly?: boolean }) {
  const { snapshot } = useSnapshot()
  const cases = useCases()
  const suggestions = useMemo(() => (snapshot ? managerSuggestions(snapshot) : []), [snapshot])
  const waitById = new Map(suggestions.map((s) => [s.bookingId, s]))
  const shown = cases.filter((c) => (suggestionsOnly ? waitById.has(c.bookingId) : c.stallReasons.length > 0))
  if (!snapshot) return null
  return (
    <div className="space-y-3">
      {suggestionsOnly && (
        <p className="text-sm text-muted-foreground">
          Follow up when a wait is at least 50% overdue. Expected waits use the assumptions shown in Forecast.
        </p>
      )}
      {shown.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {suggestionsOnly ? 'No Cases At Least 50% Overdue.' : 'No Bookings Need A Move.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((summary) => {
            const booking = snapshot.bookings.find((b) => b.id === summary.bookingId)
            if (!booking) return null
            const wait = waitById.get(booking.id)
            const explanation = wait
              ? `${wait.reason}: ${wait.elapsed} ${wait.unit} elapsed; ${wait.expected} expected.`
              : summary.stallReasons.join('. ')
            return <ManagerCase key={booking.id} booking={booking} summary={summary} explanation={explanation} />
          })}
        </div>
      )}
    </div>
  )
}

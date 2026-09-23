/**
 * Date field — the Mortar date picker (DESIGN.md Field `Date` variant): a
 * field-styled trigger reading `18 Sep 2026` beside the Calendar glyph, which
 * opens the Calendar in a Popover. Values are `YYYY-MM-DD` strings. Days
 * outside `min`–`max` are struck through and cannot be picked, and `today`
 * marks the desks' today rather than the wall clock.
 */

import { useState } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import type { Matcher } from 'react-day-picker'
import { formatDate } from '@/components/case/format'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

/** `YYYY-MM-DD` to local midnight, so the calendar shows the same day in any time zone. */
function toDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** The first of the month `iso` falls in: the calendar's navigation bounds are months, not days. */
function monthOf(iso: string): Date {
  const date = toDate(iso)
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function toIso(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function DateField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  today,
  placeholder = 'Choose A Day'
}: {
  id: string
  /** The field's visible label, repeated with the chosen day in the trigger's accessible name. */
  label: string
  value: string
  onChange: (value: string) => void
  /** Earliest day that can be picked. */
  min?: string
  /** Latest day that can be picked. */
  max?: string
  /** The desks' today, ringed on the calendar. */
  today: string
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const selected = value ? toDate(value) : undefined
  const disabled: Matcher[] = []
  if (min) disabled.push({ before: toDate(min) })
  if (max) disabled.push({ after: toDate(max) })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          aria-label={`${label}, ${value ? formatDate(value) : 'not set'}`}
          className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-card px-3 text-left text-sm transition-colors duration-[var(--motion-fast)] focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none"
        >
          <span className={cn('truncate tabular-nums', !value && 'text-muted-foreground')}>
            {value ? formatDate(value) : placeholder}
          </span>
          <CalendarIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          required
          selected={selected}
          onSelect={(date) => {
            onChange(toIso(date))
            setOpen(false)
          }}
          defaultMonth={selected ?? toDate(max && max < today ? max : today)}
          disabled={disabled}
          startMonth={min ? monthOf(min) : undefined}
          endMonth={max ? monthOf(max) : undefined}
          today={toDate(today)}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

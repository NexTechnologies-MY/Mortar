/**
 * Sortable column header for the desk tables. One button per header: the
 * first click sorts in the column's natural direction, the second flips it,
 * the third clears back to the table's default ranking, so the reader can
 * always get back without reloading. `aria-sort` names the live state.
 */

import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { TableHead } from '@/components/ui/table'
import { cn } from '@/lib/utils'

export type SortDir = 'asc' | 'desc'
export type SortState<K extends string> = { key: K; dir: SortDir } | null

/** The state after a click on `key`: first direction, then the other, then off. */
export function nextSort<K extends string>(current: SortState<K>, key: K, first: SortDir = 'desc'): SortState<K> {
  if (current?.key !== key) return { key, dir: first }
  return current.dir === first ? { key, dir: first === 'desc' ? 'asc' : 'desc' } : null
}

export function SortHeader<K extends string>({
  label,
  columnKey,
  sort,
  onSort,
  className
}: {
  label: string
  columnKey: K
  sort: SortState<K>
  onSort: (key: K) => void
  className?: string
}) {
  const active = sort?.key === columnKey
  const Icon = !active ? ChevronsUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown
  return (
    <TableHead className={className} aria-sort={!active ? 'none' : sort.dir === 'asc' ? 'ascending' : 'descending'}>
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        className={cn(
          'inline-flex items-center gap-1 rounded-sm text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors duration-[var(--motion-fast)] hover:text-foreground',
          active ? 'text-foreground' : 'text-muted-foreground',
          className?.includes('text-right') && 'flex-row-reverse'
        )}
      >
        {label}
        <Icon aria-hidden="true" className="size-3 shrink-0" />
      </button>
    </TableHead>
  )
}

/**
 * Pagination — shared page controls for tables that can exceed one page.
 * `usePagination` holds the state and slices the rows; the caller returns to
 * page one from its filter-change handler via `pagination.onPageChange(1)`
 * (the page also clamps itself when the row count shrinks).
 * `Pagination` renders the bar: a "Showing X To Y Of N" line, a rows-per-page
 * select (25, 50, 100) and back/forward buttons.
 */

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export const PAGE_SIZE_OPTIONS = [25, 50, 100] as const
const DEFAULT_PAGE_SIZE = 25

export interface PaginationState {
  total: number
  page: number
  pageCount: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function usePagination<T>(rows: T[]): { pageRows: T[]; pagination: PaginationState } {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE)

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  const current = Math.min(page, pageCount)
  const pageRows = useMemo(() => rows.slice((current - 1) * pageSize, current * pageSize), [rows, current, pageSize])

  return {
    pageRows,
    pagination: {
      total: rows.length,
      page: current,
      pageCount,
      pageSize,
      onPageChange: setPage,
      onPageSizeChange: (size) => {
        setPageSize(size)
        setPage(1)
      }
    }
  }
}

export function Pagination({
  total,
  page,
  pageCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  className
}: PaginationState & { className?: string }) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)

  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border px-3 py-2', className)}>
      <p className="text-[13px] text-muted-foreground tabular-nums">
        Showing {from} To {to} Of {total}
      </p>
      <div className="ml-auto flex items-center gap-2">
        <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
          <SelectTrigger size="sm" aria-label="Rows Per Page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} Per Page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="px-2"
                aria-label="Previous Page"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              >
                <ChevronLeft />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Previous Page</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="px-2"
                aria-label="Next Page"
                disabled={page >= pageCount}
                onClick={() => onPageChange(page + 1)}
              >
                <ChevronRight />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Next Page</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

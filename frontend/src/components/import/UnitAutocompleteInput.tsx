/**
 * UnitAutocompleteInput — Searchable dropdown input for selecting unsold project units.
 *
 * Requirements:
 * - Drops down all units in the building range that have not been sold/booked yet.
 * - Filters in real-time as the user keys in characters (words/numbers).
 * - Keyboard navigation (ArrowDown, ArrowUp, Enter, Escape).
 * - Direct text entry allowed for fast manual typing.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface UnitAutocompleteInputProps {
  value: string
  onChange: (val: string) => void
  availableUnits: string[]
  placeholder?: string
  className?: string
  hasError?: boolean
  isReady?: boolean
  disabled?: boolean
}

export function UnitAutocompleteInput({
  value,
  onChange,
  availableUnits,
  placeholder = 'e.g. A-12-08',
  className,
  hasError,
  isReady,
  disabled
}: UnitAutocompleteInputProps) {
  const [open, setOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const query = value.trim().toUpperCase()

  // Filter available units matching the typed query
  const filteredUnits = useMemo(() => {
    if (!query) return availableUnits
    return availableUnits.filter((u) => u.toUpperCase().includes(query))
  }, [availableUnits, query])

  const safeHighlightIndex = Math.min(highlightIndex, Math.max(0, filteredUnits.length - 1))

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleSelectUnit = (unit: string) => {
    onChange(unit)
    setOpen(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault()
      setOpen(true)
      return
    }

    if (!open) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((prev) => Math.min(prev + 1, Math.min(filteredUnits.length - 1, 49)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      if (filteredUnits.length > 0 && safeHighlightIndex >= 0 && safeHighlightIndex < filteredUnits.length) {
        e.preventDefault()
        handleSelectUnit(filteredUnits[safeHighlightIndex])
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center w-full">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => {
            setHighlightIndex(0)
            onChange(e.target.value)
            if (!open) setOpen(true)
          }}
          onFocus={() => {
            if (!disabled) setOpen(true)
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'h-8 text-xs font-mono font-medium pr-7',
            hasError && 'border-status-danger text-status-danger-fg',
            isReady && 'border-status-positive',
            className
          )}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
        />

        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          className="absolute right-1 flex size-6 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
          title={open ? 'Close unit dropdown' : 'Show unsold units'}
        >
          <ChevronDown className={cn('size-3.5 transition-transform duration-150', open && 'rotate-180')} />
        </button>
      </div>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 rounded-md border border-border bg-popover shadow-xl z-50 overflow-hidden">
          {/* Header summary */}
          <div className="flex items-center justify-between border-b border-border/80 px-2.5 py-1.5 bg-muted/60 text-[11px]">
            <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
              <Search className="size-3 text-primary" />
              <span>{query ? `Matching "${query}"` : 'Unsold Units'}</span>
            </div>
            <span className="font-mono text-[10px] font-semibold text-foreground bg-accent px-1.5 py-0.5 rounded border border-border/50">
              {filteredUnits.length} available
            </span>
          </div>

          {/* Scrollable unit list */}
          <div className="max-h-52 overflow-y-auto p-1 divide-y divide-border/20">
            {filteredUnits.length === 0 ? (
              <div className="p-3 text-center text-xs text-muted-foreground">
                <p className="font-medium text-foreground">No unsold units found</p>
                <p className="mt-0.5 text-[10px]">
                  {query ? `No units match "${query}" in this range` : 'All units in this range are already booked'}
                </p>
              </div>
            ) : (
              filteredUnits.slice(0, 50).map((unit, idx) => {
                const isSelected = unit.toUpperCase() === query
                const isHighlighted = idx === safeHighlightIndex

                return (
                  <button
                    key={unit}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleSelectUnit(unit)
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded px-2 py-1.5 text-xs text-left transition-colors cursor-pointer',
                      isHighlighted ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60 text-foreground',
                      isSelected && 'font-bold text-primary'
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      {isSelected ? (
                        <Check className="size-3 text-primary shrink-0" />
                      ) : (
                        <span className="size-1.5 rounded-full bg-status-positive shrink-0" />
                      )}
                      <span className="font-mono font-semibold">{unit}</span>
                    </div>

                    <span className="text-[10px] text-muted-foreground font-sans">Unsold</span>
                  </button>
                )
              })
            )}

            {filteredUnits.length > 50 && (
              <div className="p-1.5 text-center text-[10px] text-muted-foreground bg-muted/20">
                + {filteredUnits.length - 50} more units. Type words or numbers to filter.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

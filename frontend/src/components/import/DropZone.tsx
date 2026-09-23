/**
 * Drop zone — the file target for bringing a booking sheet into Mortar.
 * Built to the spec's Drop Zone anatomy: 6px radius, dashed --input at rest,
 * a 2px --ring dashed edge while a file is over it, and a solid hairline once
 * a file is held. Replaces a native <input type="file">, which is banned.
 *
 * It accepts one XLSX or CSV file and reports it; the page reads the rows and
 * passes back what it found (`detail`, `badge`) for the Parsed state.
 */

import { useId, useRef, useState, type ReactNode } from 'react'
import { FileSpreadsheet, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { sheetKind } from './readSheetFile'

const ACCEPT = '.xlsx,.csv'
const MAX_BYTES = 10 * 1024 * 1024

function readableSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DropZone({
  onFile,
  detail,
  badge,
  className
}: {
  onFile?: (file: File | null) => void
  /** What the page found in the held file, e.g. `146 Rows Read`; the size shows until then. */
  detail?: ReactNode
  /** A status pill beside the file, e.g. `3 To Review`. */
  badge?: ReactNode
  className?: string
}) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const describedBy = useId()

  function accept(next: File | null) {
    if (next && !sheetKind(next.name)) {
      setError('Only XLSX Or CSV Files Can Be Read. Save The Sheet In One Of Those Formats.')
      return
    }
    if (next && next.size > MAX_BYTES) {
      setError(`That File Is ${readableSize(next.size)}. The Limit Is 10 MB.`)
      return
    }
    setError(null)
    setFile(next)
    onFile?.(next)
  }

  function clear() {
    accept(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  if (file) {
    return (
      <div className={cn('flex items-center gap-3 rounded-md border border-border bg-card p-4', className)}>
        <FileSpreadsheet aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-[13px] text-muted-foreground tabular-nums">{detail ?? readableSize(file.size)}</p>
        </div>
        {badge}
        <Button type="button" variant="ghost" size="sm" onClick={clear} aria-label={`Remove ${file.name}`}>
          <X aria-hidden="true" />
          Remove
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <button
        type="button"
        aria-describedby={describedBy}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          accept(e.dataTransfer.files[0] ?? null)
        }}
        className={cn(
          'flex h-40 w-full flex-col items-center justify-center gap-2 rounded-md border-dashed transition-colors duration-[var(--motion-fast)]',
          dragging ? 'border-2 border-ring bg-selected' : 'border border-input bg-card hover:bg-accent'
        )}
      >
        <Upload aria-hidden="true" className={cn('size-5', dragging ? 'text-link' : 'text-muted-foreground')} />
        <span className="text-sm font-medium">{dragging ? 'Release To Add The File' : 'Drop The Booking Sheet'}</span>
        <span id={describedBy} className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          XLSX Or CSV, Up To 10 MB
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => accept(e.target.files?.[0] ?? null)}
      />
      {error ? <p className="text-[13px] text-status-danger-fg">{error}</p> : null}
    </div>
  )
}

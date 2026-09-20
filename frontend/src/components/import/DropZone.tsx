/**
 * Drop zone — the file target for bringing a booking sheet into Mortar.
 * Built to the spec's Drop Zone anatomy: 6px radius, dashed --input at rest,
 * a 2px --ring dashed edge while a file is over it, and a solid hairline once
 * a file is held. Replaces a native <input type="file">, which is banned.
 *
 * This is the shell only. It accepts a file and reports it; parsing, column
 * mapping and committing rows are separate work.
 */

import { useId, useRef, useState } from 'react'
import { FileSpreadsheet, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ACCEPT = '.xlsx,.csv'
const MAX_BYTES = 10 * 1024 * 1024

function readableSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DropZone({ onFile, className }: { onFile?: (file: File | null) => void; className?: string }) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const describedBy = useId()

  function accept(next: File | null) {
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
      <div className={cn('flex flex-col gap-3', className)}>
        <div className="flex items-center gap-3 rounded-md border border-border bg-card p-4">
          <FileSpreadsheet aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-[13px] text-muted-foreground tabular-nums">{readableSize(file.size)} · Ready To Read</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={clear} aria-label={`Remove ${file.name}`}>
            <X aria-hidden="true" />
            Remove
          </Button>
        </div>
        <p className="text-[13px] text-muted-foreground">
          Reading The Rows Is Not Built Yet. The File Stays In Your Browser.
        </p>
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

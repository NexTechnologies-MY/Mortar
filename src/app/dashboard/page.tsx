import type { Metadata } from 'next'
import { NoteForm } from '@/components/notes/note-form'
import { NoteList } from '@/components/notes/note-list'
import { getDb } from '@/lib/db'
import { listNotes } from '@/lib/notes'
import { requireUser } from '@/lib/session'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const user = await requireUser()
  const notes = await listNotes(getDb(), user.id)

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="type-heading-32">Notes</h1>
          <p className="type-copy-16 text-muted-foreground">
            The example feature. Follow it from the schema to{' '}
            <code translate="no" className="font-mono type-copy-14">
              src/lib/notes.ts
            </code>
            , the actions & this page.
          </p>
        </div>
        <NoteForm />
      </section>
      <section aria-label="Your notes" className="flex flex-col gap-3">
        <p className="type-label-13 text-muted-foreground tabular-nums">
          {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        </p>
        <NoteList notes={notes} />
      </section>
    </div>
  )
}

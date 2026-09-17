import { DeleteNoteButton } from '@/components/notes/delete-note-button'
import type { Note } from '@/lib/db/schema'

const formatDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' })

export function NoteList({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="type-heading-16">No notes yet</p>
        <p className="mt-1 type-copy-14 text-muted-foreground">Add the first one with the form.</p>
      </div>
    )
  }
  return (
    <ul className="divide-y rounded-lg border">
      {notes.map((note) => (
        <li key={note.id} className="flex items-start justify-between gap-4 p-4">
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="type-heading-16">{note.title}</h2>
            {note.body ? <p className="type-copy-14 whitespace-pre-wrap text-muted-foreground">{note.body}</p> : null}
            <time dateTime={note.createdAt.toISOString()} className="type-label-13 tabular-nums text-muted-foreground">
              {formatDate.format(note.createdAt)}
            </time>
          </div>
          <DeleteNoteButton id={note.id} title={note.title} />
        </li>
      ))}
    </ul>
  )
}

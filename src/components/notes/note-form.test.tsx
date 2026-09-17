import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { NoteForm } from './note-form'

const createNoteAction = vi.fn()
vi.mock('@/app/dashboard/actions', () => ({
  createNoteAction: (...args: unknown[]) => createNoteAction(...args)
}))

describe('<NoteForm/>', () => {
  it('shows the server-side validation error', async () => {
    createNoteAction.mockResolvedValue({ ok: false, error: 'Title is required' })
    render(<NoteForm />)

    await userEvent.click(screen.getByRole('button', { name: 'Add Note' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Title is required')
  })

  it('clears the fields after a successful save', async () => {
    createNoteAction.mockResolvedValue({ ok: true })
    render(<NoteForm />)
    const title = screen.getByLabelText('Title')

    await userEvent.type(title, 'Buy snacks')
    expect(title).toHaveValue('Buy snacks')
    await userEvent.click(screen.getByRole('button', { name: 'Add Note' }))

    await vi.waitFor(() => expect(title).toHaveValue(''))
  })
})

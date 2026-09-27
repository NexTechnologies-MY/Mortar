import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { DEFAULT_PROJECT_SETTINGS } from '@mortar/core'
import { PersonaProvider } from '@/lib/persona'
import { ProjectSettingsCard } from '@/components/settings/ProjectSettingsCard'
import { fetchProjectSettings, saveProjectSettings } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  fetchProjectSettings: vi.fn(async () => ({ settings: DEFAULT_PROJECT_SETTINGS })),
  saveProjectSettings: vi.fn(async (settings) => ({ settings }))
}))

function renderCard(persona: 'manager' | 'sales-admin' = 'manager') {
  return render(
    <PersonaProvider initialPersona={persona}>
      <ProjectSettingsCard />
    </PersonaProvider>
  )
}

describe('ProjectSettingsCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads shared settings and displays block range and law firm', async () => {
    renderCard()
    expect(await screen.findByDisplayValue('Residensi Cahaya Muda')).toBeTruthy()
    expect(screen.getByDisplayValue('A')).toBeTruthy()
    expect(screen.getByDisplayValue('1')).toBeTruthy()
    expect(screen.getByDisplayValue('35')).toBeTruthy()
    expect(screen.getByText('Default Panel Law Firm')).toBeTruthy()
    expect(fetchProjectSettings).toHaveBeenCalledOnce()
  })

  it('updates the live multi-block inventory preview', async () => {
    renderCard()
    await waitFor(() => expect(screen.queryByText('Loading Project Settings…')).toBeNull())
    const blocks = await screen.findByLabelText('Blocks')
    fireEvent.change(blocks, { target: { value: 'B, C' } })
    expect(screen.getByText(/B-01-01 to C-35-12 \(840 units\)/)).toBeTruthy()
  })

  it('saves the complete block list to the server', async () => {
    renderCard()
    await waitFor(() => expect(screen.queryByText('Loading Project Settings…')).toBeNull())
    const blocks = await screen.findByLabelText('Blocks')
    fireEvent.change(blocks, { target: { value: 'A, B' } })
    fireEvent.click(screen.getByRole('button', { name: /Save Settings/ }))
    await waitFor(() => expect(saveProjectSettings).toHaveBeenCalledOnce())
    expect(vi.mocked(saveProjectSettings).mock.calls[0][0].blocks).toEqual(['A', 'B'])
  })

  it('prevents a configured inventory from exceeding 10,000 units', async () => {
    renderCard()
    await waitFor(() => expect(screen.queryByText('Loading Project Settings…')).toBeNull())
    fireEvent.change(screen.getByLabelText('Last Floor'), { target: { value: '200' } })
    fireEvent.change(screen.getByLabelText('Units Per Floor'), { target: { value: '51' } })
    expect(screen.getByRole('alert').textContent).toContain('10,000 Units')
    expect((screen.getByRole('button', { name: /Save Settings/ }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('disables settings for non-managers', async () => {
    renderCard('sales-admin')
    const field = await screen.findByLabelText('Blocks')
    expect((field as HTMLInputElement).closest('fieldset')?.disabled).toBe(true)
    expect(screen.getByText('Only A Manager Can Change These Settings.')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Save Settings' })).toBeNull()
  })
})

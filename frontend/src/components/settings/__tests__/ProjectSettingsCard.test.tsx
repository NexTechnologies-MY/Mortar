import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ProjectSettingsCard } from '@/components/settings/ProjectSettingsCard'

describe('ProjectSettingsCard', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders default project settings, unit ranges, and panel law firms', () => {
    render(<ProjectSettingsCard />)

    expect(screen.getByText('Project & Unit Range Settings')).toBeTruthy()
    expect(screen.getByDisplayValue('Bukit Damai')).toBeTruthy()
    expect(screen.getByDisplayValue('A')).toBeTruthy()
    expect(screen.getByDisplayValue('1')).toBeTruthy()
    expect(screen.getByDisplayValue('35')).toBeTruthy()
    expect(screen.getByDisplayValue('12')).toBeTruthy()
    expect(screen.getByText('Teh & Partners')).toBeTruthy()
  })

  it('uses defaultProjectName prop when provided', () => {
    render(<ProjectSettingsCard defaultProjectName="Residensi Cahaya Muda" />)
    expect(screen.getByDisplayValue('Residensi Cahaya Muda')).toBeTruthy()
  })

  it('updates unit range settings and displays live unit preview', () => {
    render(<ProjectSettingsCard />)

    const blockInput = screen.getByDisplayValue('A')
    fireEvent.change(blockInput, { target: { value: 'B' } })

    expect(screen.getByText(/B-01-01 to B-35-12/i)).toBeTruthy()
  })

  it('folds unit models behind a toggle and allows adding a new layout model', () => {
    render(<ProjectSettingsCard />)

    const toggle = screen.getByRole('button', { name: /Unit Layouts \(3\)/i })
    expect(toggle).toBeTruthy()
    fireEvent.click(toggle)

    expect(screen.getByDisplayValue('Type A')).toBeTruthy()
    expect(screen.getByDisplayValue('Type B')).toBeTruthy()
    expect(screen.getByDisplayValue('Type C (Dual Key)')).toBeTruthy()

    // Add new model
    const addBtn = screen.getByRole('button', { name: /Add Model \/ Layout/i })
    fireEvent.click(addBtn)

    expect(screen.getByDisplayValue('Type D')).toBeTruthy()
  })
})

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

  it('updates unit range settings and displays live unit preview', () => {
    render(<ProjectSettingsCard />)

    const blockInput = screen.getByDisplayValue('A')
    fireEvent.change(blockInput, { target: { value: 'B' } })

    expect(screen.getByText(/B-01-01 to B-35-12/i)).toBeTruthy()
  })
})

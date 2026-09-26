import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PersonaProvider } from '@/lib/persona'
import { PersonaDeskLens } from '../PersonaDeskLens'

describe('PersonaDeskLens', () => {
  it('renders default sales admin purview and information boundaries', () => {
    render(
      <PersonaProvider>
        <PersonaDeskLens />
      </PersonaProvider>
    )

    expect(screen.getByText('Sales Admin Desk')).toBeTruthy()
    expect(screen.getByText('Buyer Chasing & Lead Progression')).toBeTruthy()
    expect(screen.getByText(/Buyer contact signals/)).toBeTruthy()
  })

  it('renders loan admin when initialized with loan-admin', () => {
    render(
      <PersonaProvider initialPersona="loan-admin">
        <PersonaDeskLens />
      </PersonaProvider>
    )

    expect(screen.getByText('Loan Admin Desk')).toBeTruthy()
    expect(screen.getByText('Full Underwriting & Bank Tracking')).toBeTruthy()
    expect(screen.getByText(/Full credit ratios, DSR calculations/)).toBeTruthy()
  })

  it('allows switching to Sales Admin and updates the visible lens and boundaries', () => {
    render(
      <PersonaProvider initialPersona="loan-admin">
        <PersonaDeskLens />
      </PersonaProvider>
    )

    const salesBtn = screen.getByRole('button', { name: /Sales Admin/i })
    fireEvent.click(salesBtn)

    expect(screen.getByText('Sales Admin Desk')).toBeTruthy()
    expect(screen.getByText('Buyer Chasing & Lead Progression')).toBeTruthy()
    expect(screen.getByText(/Confidential bank DSR ratios/)).toBeTruthy()
  })

  it('allows switching to Legal Admin and highlights Malaysian PDPA boundary', () => {
    render(
      <PersonaProvider>
        <PersonaDeskLens />
      </PersonaProvider>
    )

    const legalBtn = screen.getByRole('button', { name: /Legal Admin/i })
    fireEvent.click(legalBtn)

    expect(screen.getByText('Legal Admin Desk')).toBeTruthy()
    expect(screen.getByText('Conveyancing & SPA Execution')).toBeTruthy()
    expect(
      screen.getByText(/Buyer gross income, debt commitments, and bank rejection logs are masked per PDPA/)
    ).toBeTruthy()
  })
})

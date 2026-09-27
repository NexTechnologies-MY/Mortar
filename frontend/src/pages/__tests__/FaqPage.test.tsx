/**
 * FAQ page tests. jsdom lacks matchMedia and requestAnimationFrame, which the
 * theme hook behind the header's ThemeToggle calls, so the hoisted block stubs
 * them — matchMedia answers false, resolving the light theme.
 */
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@/hooks/useTheme'
import { FaqPage } from '@/pages/FaqPage'

vi.hoisted(() => {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false
    }) as unknown as MediaQueryList
  window.requestAnimationFrame = (callback: FrameRequestCallback) => window.setTimeout(callback, 0)
})

const renderPage = () =>
  render(
    <MemoryRouter>
      <ThemeProvider>
        <FaqPage />
      </ThemeProvider>
    </MemoryRouter>
  )

describe('FaqPage', () => {
  it('renders its page title', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: 'Frequently Asked Questions' })).toBeTruthy()
  })

  it('asks every question as a heading', () => {
    renderPage()
    const questions = [
      'What Is Mortar?',
      'Who Uses Mortar, And Where Does Each Role Start?',
      'Is The Data Real?',
      'What Do The Stage And Risk Labels Mean?',
      'When Does A Booking Land On Today?',
      'What Does Jev Do?',
      'Where Does The Data Come From, And How Is It Refreshed?',
      'How Does The Forecast Work?',
      'Why Is There No Real Sign-In?'
    ]
    for (const question of questions) {
      expect(screen.getByRole('heading', { level: 2, name: question })).toBeTruthy()
    }
  })

  it('says plainly that the prototype runs on simulated data', () => {
    renderPage()
    expect(screen.getByText(/everything in it runs on simulated data/i)).toBeTruthy()
    expect(screen.getByText(/every booking, buyer, banker, bank and law firm is invented/i)).toBeTruthy()
  })

  it('answers that AI proposes and people confirm', () => {
    renderPage()
    expect(screen.getByText(/confirms, disputes or dismisses every suggestion/i)).toBeTruthy()
    expect(screen.getByText(/under 60% confidence is flagged needs review/i)).toBeTruthy()
  })

  it('answers that the forecast counts signed SPAs, not bookings', () => {
    renderPage()
    expect(screen.getByText(/it counts signed spas, not bookings/i)).toBeTruthy()
    expect(screen.getByText(/expected signings within 30 days of booking/i)).toBeTruthy()
  })

  it('names the sources behind the risk and stall limits', () => {
    renderPage()
    expect(screen.getAllByText(/association of banks in malaysia/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/bank negara malaysia/i).length).toBeGreaterThan(0)
  })

  it('details persona pages, Today list, Copilot, and stage labels', () => {
    renderPage()
    expect(screen.getByText(/Sales Admin: Today \(home\), Bookings, Add Bookings, Forecast, Settings/i)).toBeTruthy()
    expect(screen.getByText(/Loan Admin: Bookings \(home\), Today, Forecast, Settings/i)).toBeTruthy()
    expect(screen.getByText(/Legal Admin: Legal \(home\), Today, Bookings, Forecast, Settings/i)).toBeTruthy()
    expect(
      screen.getByText(/Manager: Manager \(home\), Today, Bookings, Legal, Add Bookings, Forecast, Settings/i)
    ).toBeTruthy()
    expect(
      screen.getByText(
        /a sales admin sees only the bookings they took; loan and legal admins see only cases currently assigned to them or with an open task assigned to them; and the Manager sees everything/i
      )
    ).toBeTruthy()
    expect(
      screen.getByText(/Who Holds Each Booking, filters the table by Buyer, Bank, Solicitor, Signed or Us/i)
    ).toBeTruthy()
    expect(screen.getByText(/Copilot, the sparkle button in the top bar/i)).toBeTruthy()
    expect(
      screen.getByText(
        /Stage labels read Booked, With Bank, Loan Approved, Loan Agreement, Disbursed, SPA Signed, Cancelled, Lapsed/i
      )
    ).toBeTruthy()
  })
})

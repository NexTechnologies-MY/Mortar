import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog'
import { Sheet, SheetContent } from '@/components/ui/sheet'

describe('modal scrims', () => {
  it('dims and blurs the page behind dialogs with the shared scrim tokens', () => {
    render(
      <Dialog open>
        <DialogOverlay data-testid="dialog-overlay" />
        <DialogContent>Dialog content</DialogContent>
      </Dialog>
    )

    const overlay = screen.getByTestId('dialog-overlay')
    expect(overlay.className).toContain('bg-[var(--scrim)]')
    expect(overlay.className).toContain('backdrop-blur-[var(--scrim-blur)]')
  })

  it('dims and blurs the page behind sheets with the shared scrim tokens', () => {
    render(
      <Sheet open>
        <SheetContent>Sheet content</SheetContent>
      </Sheet>
    )

    const overlay = document.querySelector('[data-state="open"]')
    expect(overlay?.className).toContain('bg-[var(--scrim)]')
    expect(overlay?.className).toContain('backdrop-blur-[var(--scrim-blur)]')
  })
})

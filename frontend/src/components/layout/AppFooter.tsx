/**
 * Site footer content — Perch's `.foot-inner`, ported for Mortar.
 * SiteShell emits the fixed <footer> element; this renders the brand lockup,
 * tagline, and the four links inside it, left-aligned to the page gutter.
 * No year line. The hairline above the footer is set on the element in
 * SiteShell, since the footer ground is now the same white as the page.
 */

import { Link } from 'react-router-dom'
import { MortarMark } from '@/components/brand/MortarMark'

const FOOTER_LINKS: { label: string; to: string; external?: boolean }[] = [
  { label: 'FAQ', to: '/faq' },
  { label: 'Dashboard', to: '/app' },
  {
    label: 'Design',
    to: 'https://www.figma.com/design/CTy3FDK15W2QLQmB3h5f1I/Mortar-Design-System?node-id=0-1&t=BmfrHmxUj0uuvRDc-1',
    external: true
  },
  { label: 'GitHub', to: 'https://github.com/NexTechnologies-MY/mortar', external: true }
]

const LINK_CLASS = 'foot-link text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground no-underline'

/** Renders the footer's inner grid: brand, tagline, links, left-aligned to the page gutter. */
export function AppFooter() {
  return (
    <div className="grid h-full content-center gap-3 px-6 min-[720px]:px-12">
      <Link to="/" aria-label="Mortar home" className="inline-flex items-center gap-2 text-foreground no-underline">
        <MortarMark size={28} />
        <span className="text-base font-semibold">Mortar</span>
      </Link>
      <p className="max-w-[40ch] text-sm text-muted-foreground">A Booking Is A Promise. The Signed SPA Is The Sale.</p>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {FOOTER_LINKS.map((l) =>
          l.external ? (
            <a key={l.label} href={l.to} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
              {l.label}
            </a>
          ) : (
            <Link key={l.label} to={l.to} className={LINK_CLASS}>
              {l.label}
            </Link>
          )
        )}
      </div>
    </div>
  )
}

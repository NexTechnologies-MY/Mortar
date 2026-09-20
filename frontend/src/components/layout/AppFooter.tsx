/**
 * The site footer — the closing block on the two public pages.
 *
 * PublicShell mounts it under `/` and `/faq` only; the app routes, the 404 and
 * `/sign-in` carry no footer. It emits its own `<footer>` element, so it is the
 * page's `contentinfo` landmark.
 *
 * Layout is a brand cell plus three link columns, then a hairline and a bottom
 * bar. It stacks to one column below 720px and takes the landing's gutter
 * exactly — 24px, 48px from 720px up — so the brand lockup here sits on the
 * same vertical line as the wordmark in the header above it.
 */

import { Link } from 'react-router-dom'
import { MortarMark } from '@/components/brand/MortarMark'

type FooterLink = { label: string; to: string; external?: boolean }

const FIGMA_URL =
  'https://www.figma.com/design/CTy3FDK15W2QLQmB3h5f1I/Mortar-Design-System?node-id=0-1&t=BmfrHmxUj0uuvRDc-1'
const GITHUB_URL = 'https://github.com/NexTechnologies-MY/mortar'

/** The footer's link inventory, grouped into the columns it renders. */
const LINK_COLUMNS: { heading: string; links: FooterLink[] }[] = [
  {
    heading: 'Product',
    links: [
      { label: 'Chase List', to: '/chase' },
      { label: 'Bookings', to: '/bookings' },
      { label: 'Forecast', to: '/forecast' }
    ]
  },
  {
    heading: 'Company',
    links: [
      { label: 'FAQ', to: '/faq' },
      { label: 'Dashboard', to: '/app' },
      { label: 'Design', to: FIGMA_URL, external: true }
    ]
  },
  {
    heading: 'Code',
    links: [{ label: 'GitHub', to: GITHUB_URL, external: true }]
  }
]

const LINK_CLASS = 'text-sm text-muted-foreground no-underline transition-colors hover:text-foreground'

/** Renders one column's link, as an anchor when it leaves the app. */
function FooterLinkItem({ link }: { link: FooterLink }) {
  return (
    <li>
      {link.external ? (
        <a href={link.to} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
          {link.label}
        </a>
      ) : (
        <Link to={link.to} className={LINK_CLASS}>
          {link.label}
        </Link>
      )}
    </li>
  )
}

/** Renders the site footer: brand lockup, tagline, link columns and bottom bar. */
export function AppFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-footer">
      <div className="px-6 py-12 min-[720px]:px-12 min-[720px]:py-16">
        <div className="grid gap-10 min-[720px]:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))] min-[720px]:gap-8">
          <div className="flex flex-col gap-3">
            <Link
              to="/"
              aria-label="Mortar home"
              className="inline-flex w-fit items-center gap-2 text-foreground no-underline"
            >
              <MortarMark size={28} />
              <span className="text-base font-semibold">Mortar</span>
            </Link>
            <p className="max-w-[40ch] text-sm leading-6 text-muted-foreground">
              A Booking Is A Promise. The Signed SPA Is The Sale.
            </p>
          </div>

          {LINK_COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading} className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-foreground">{column.heading}</p>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <FooterLinkItem key={link.label} link={link} />
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-[13px] text-muted-foreground min-[720px]:flex-row min-[720px]:items-center min-[720px]:justify-between">
          <p>© {year} Mortar</p>
          <p>Internal Tool · Simulated Data</p>
        </div>
      </div>
    </footer>
  )
}

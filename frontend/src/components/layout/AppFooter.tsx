/**
 * The site footer's content — the colophon that closes the two public pages.
 *
 * PublicShell mounts it under `/` and `/faq` only, inside the fixed footer the
 * page column folds over to reveal; the app routes, the 404 and `/sign-in`
 * carry no footer. The landmark `<footer>` element is emitted by the shell, so
 * this renders the inner block only.
 *
 * Set like a book's colophon rather than a link farm: the brand lockup and the
 * promise line on the first row, the destinations as one run of labelled
 * groups, then the closing line. It takes the landing's gutter — 24px, 48px
 * from 720px up — so the mark here sits on the same vertical line as the
 * wordmark in the bar above it.
 */

import { Link } from 'react-router-dom'
import { MortarMark } from '@/components/brand/MortarMark'

type FooterLink = { label: string; to: string; external?: boolean }

const FIGMA_URL =
  'https://www.figma.com/design/CTy3FDK15W2QLQmB3h5f1I/Mortar-Design-System?node-id=0-1&t=BmfrHmxUj0uuvRDc-1'
const GITHUB_URL = 'https://github.com/NexTechnologies-MY/mortar'

/** The footer's link inventory, grouped into the runs it renders. */
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

/** Renders one group's link, as an anchor when it leaves the app. */
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

/** Renders the colophon: brand row, the labelled link runs, the closing line. */
export function AppFooter() {
  const year = new Date().getFullYear()

  return (
    <div className="px-6 py-8 min-[720px]:px-12 min-[720px]:py-9">
      <div className="flex flex-col gap-3 min-[720px]:flex-row min-[720px]:items-baseline min-[720px]:justify-between">
        <Link
          to="/"
          aria-label="Mortar home"
          className="inline-flex w-fit items-center gap-2 text-foreground no-underline"
        >
          <MortarMark size={24} />
          <span className="text-[15px] font-semibold tracking-[-0.01em]">Mortar</span>
        </Link>
        <p className="text-sm text-muted-foreground">A Booking Is A Promise. The Signed SPA Is The Sale.</p>
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-border pt-6 min-[720px]:flex-row min-[720px]:gap-12">
        {LINK_COLUMNS.map((column) => (
          <nav key={column.heading} aria-label={column.heading} className="flex items-baseline gap-4">
            <p className="w-16 shrink-0 text-[11px] leading-[14px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {column.heading}
            </p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {column.links.map((link) => (
                <FooterLinkItem key={link.label} link={link} />
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-1 border-t border-border pt-5 text-[13px] text-muted-foreground min-[720px]:flex-row min-[720px]:items-center min-[720px]:justify-between">
        <p>© {year} Mortar</p>
        <p>Internal Tool · Simulated Data</p>
      </div>
    </div>
  )
}

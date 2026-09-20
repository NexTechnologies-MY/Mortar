/**
 * Site footer content — the drawer the page column folds away to reveal.
 * SiteShell emits the fixed <footer> element; this renders the brand cell and
 * the Product, Company and Code link columns inside it, aligned to the public
 * container's edge. There is no divider and no bottom bar: the copyright line
 * sits directly under the brand lockup, and every destination is real — no
 * Changelog, no Status.
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

/** Renders one column's link, as an anchor when it leaves the app. */
function FooterLinkItem({ link }: { link: FooterLink }) {
  return (
    <li>
      {link.external ? (
        <a href={link.to} target="_blank" rel="noopener noreferrer" className="foot-link">
          {link.label}
        </a>
      ) : (
        <Link to={link.to} className="foot-link">
          {link.label}
        </Link>
      )}
    </li>
  )
}

/** Renders the footer's inner content: brand cell, then the link columns. */
export function AppFooter() {
  const year = new Date().getFullYear()

  return (
    <div className="foot-inner">
      <div className="foot-brand">
        <Link to="/" aria-label="Mortar home" className="foot-lockup">
          <MortarMark size={28} />
          <span>Mortar</span>
        </Link>
        <p className="foot-copy">© {year} Mortar</p>
        <p className="foot-tag">A Booking Is A Promise. The Signed SPA Is The Sale.</p>
      </div>
      {LINK_COLUMNS.map((column) => (
        <nav key={column.heading} aria-label={column.heading} className="foot-col">
          <p className="foot-head">{column.heading}</p>
          <ul className="foot-list">
            {column.links.map((link) => (
              <FooterLinkItem key={link.label} link={link} />
            ))}
          </ul>
        </nav>
      ))}
    </div>
  )
}

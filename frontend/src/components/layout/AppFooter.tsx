/**
 * Site footer content — the drawer the page column folds away to reveal.
 * SiteShell emits the fixed <footer> element; this renders the brand lockup,
 * tagline, link row and fine print inside it, centred vertically and aligned
 * to the public container's edge.
 *
 * It is deliberately compact: the drawer is a fixed-height layer, so the
 * footer is one brand block plus one row of real destinations — there is no
 * Changelog and no Status — and the closing line of fine print.
 */

import { Link } from 'react-router-dom'
import { MortarMark } from '@/components/brand/MortarMark'

type FooterLink = { label: string; to: string; external?: boolean }

const FIGMA_URL =
  'https://www.figma.com/design/CTy3FDK15W2QLQmB3h5f1I/Mortar-Design-System?node-id=0-1&t=BmfrHmxUj0uuvRDc-1'
const GITHUB_URL = 'https://github.com/NexTechnologies-MY/mortar'

/** The footer's whole link inventory; every destination is real. */
const FOOTER_LINKS: FooterLink[] = [
  { label: 'FAQ', to: '/faq' },
  { label: 'Dashboard', to: '/app' },
  { label: 'Design', to: FIGMA_URL, external: true },
  { label: 'GitHub', to: GITHUB_URL, external: true }
]

/** Renders one footer link, as an anchor when it leaves the app. */
function FooterLinkItem({ link }: { link: FooterLink }) {
  return link.external ? (
    <a href={link.to} target="_blank" rel="noopener noreferrer" className="foot-link">
      {link.label}
    </a>
  ) : (
    <Link to={link.to} className="foot-link">
      {link.label}
    </Link>
  )
}

/** Renders the footer's inner content: brand, tagline, links, fine print. */
export function AppFooter() {
  const year = new Date().getFullYear()

  return (
    <div className="foot-inner">
      <div className="foot-main">
        <Link to="/" aria-label="Mortar home" className="foot-brand">
          <MortarMark size={26} />
          <span>Mortar</span>
        </Link>
        <p className="foot-tag">A Booking Is A Promise. The Signed SPA Is The Sale.</p>
      </div>
      <nav className="foot-links" aria-label="Site">
        {FOOTER_LINKS.map((link) => (
          <FooterLinkItem key={link.label} link={link} />
        ))}
      </nav>
      <p className="foot-fine">© {year} Mortar · Internal Tool · Simulated Data</p>
    </div>
  )
}

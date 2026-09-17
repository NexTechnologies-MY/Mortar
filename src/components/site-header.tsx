import Link from 'next/link'
import { UserMenu } from '@/components/auth/user-menu'

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/chat', label: 'Chat' }
]

export function SiteHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        <nav aria-label="Primary" className="flex items-center gap-1">
          <Link
            href="/"
            translate="no"
            className="mr-4 flex items-center gap-2 rounded-lg type-label-14 font-semibold focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <span aria-hidden className="inline-block size-2.5 rounded-sm bg-foreground" />
            Hackathon Starter
          </Link>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-1.5 type-label-14 text-muted-foreground transition-colors duration-150 hover:bg-gray-100 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <UserMenu />
      </div>
    </header>
  )
}

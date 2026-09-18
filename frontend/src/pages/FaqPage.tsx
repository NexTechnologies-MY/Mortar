/**
 * FAQ route.
 * A skeleton until the interview findings land: the landing's top row over a
 * centred title block and an empty state. Sits inside SiteShell so the reveal
 * footer shows, and outside AppShell like the landing.
 */
import { Link } from 'react-router-dom'
import { MessageCircleQuestion } from 'lucide-react'
import { MortarMark } from '@/components/brand/MortarMark'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/EmptyState'

// TODO(#1): write the FAQ content — https://github.com/NexTechnologies-MY/mortar/issues/1
/** Renders the FAQ placeholder: brand row, title block, empty state. */
export function FaqPage() {
  return (
    <main className="min-h-dvh bg-background">
      <header className="mx-auto flex w-full max-w-[1040px] items-center gap-3 px-6 pt-6 min-[900px]:px-12 min-[900px]:pt-8">
        <Link to="/" aria-label="Mortar home" className="inline-flex items-center gap-3 text-foreground no-underline">
          <MortarMark size={36} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em]">Mortar</span>
        </Link>
        <Button asChild className="ml-auto">
          <Link to="/sign-in">Open Mortar</Link>
        </Button>
      </header>
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 px-6 pt-24 text-center">
        <p className="text-[11px] leading-[14px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          FAQ
        </p>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">
          Answers Are On The Way. Until Then, The Landing Page And The Design System Cover The Basics.
        </p>
        <EmptyState
          icon={MessageCircleQuestion}
          title="Questions Are Being Written"
          description="Check Back Once The Interview Findings Are In."
        />
      </div>
    </main>
  )
}

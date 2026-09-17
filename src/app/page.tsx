import Link from 'next/link'
import { Button } from '@/components/ui/button'

const INSIDE = [
  {
    title: 'Auth',
    body: 'Email & password out of the box, GitHub & Google when you add keys. Better Auth over Drizzle.',
    where: 'src/lib/auth.ts'
  },
  {
    title: 'Database',
    body: 'Postgres dialect everywhere: PGlite on your laptop, DATABASE_URL in production. Migrations included.',
    where: 'src/lib/db/'
  },
  {
    title: 'Example feature',
    body: 'Notes: table, query module, server action, page, unit test, e2e test. Copy it, then delete it.',
    where: 'src/lib/notes.ts'
  },
  {
    title: 'AI chat',
    body: 'Streaming chat through the AI SDK with a free Gemini key from Google AI Studio.',
    where: 'src/app/api/chat/route.ts'
  },
  {
    title: 'Tests',
    body: 'Vitest runs against an in-memory Postgres in about a second. Playwright covers the happy path.',
    where: 'src/**/*.test.ts, e2e/'
  },
  {
    title: 'Agent docs',
    body: 'AGENTS.md maps every feature to its files & commands, so coding agents stay on track.',
    where: 'AGENTS.md'
  }
]

export default function HomePage() {
  return (
    <div className="flex flex-col gap-24">
      <section className="flex flex-col items-start gap-6 pt-12 sm:pt-20">
        <h1 className="max-w-3xl type-heading-48 sm:type-heading-56">Ship the demo, not the boilerplate.</h1>
        <p className="max-w-xl type-copy-20 text-muted-foreground">
          Auth, database, an example feature, AI chat & tests are wired and green. Delete what you don&rsquo;t need and
          build.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg" shape="pill">
            <Link href="/sign-up">Get started</Link>
          </Button>
          <Button asChild size="lg" shape="pill" variant="outline">
            <Link href="/dashboard">Open dashboard</Link>
          </Button>
        </div>
      </section>

      <section aria-labelledby="inside-heading" className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 id="inside-heading" className="type-heading-32">
            What&rsquo;s inside
          </h2>
          <p className="max-w-xl type-copy-16 text-muted-foreground">
            One worked example per layer. Each card names the file to open first.
          </p>
        </div>
        <dl className="grid overflow-hidden rounded-xl border bg-border gap-px sm:grid-cols-2 lg:grid-cols-3">
          {INSIDE.map((item) => (
            <div key={item.title} className="flex flex-col gap-3 bg-background p-6">
              <dt className="type-heading-16">{item.title}</dt>
              <dd className="type-copy-14 text-muted-foreground">{item.body}</dd>
              <dd>
                <code translate="no" className="type-label-13 font-mono text-muted-foreground">
                  {item.where}
                </code>
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}

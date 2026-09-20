/**
 * Status card — the server's own health report: the API itself, the database
 * connection, and whether a TypeSafe key is configured for Jev. The page owns
 * the `GET /api/health` fetch and re-checks after a reset.
 */

import type { Health } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusPill } from '@/components/ui/status-pill'

function row(
  label: string,
  ok: boolean | null,
  note: string,
  pills: { up: string; down: string } = { up: 'Connected', down: 'Unavailable' }
) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-2 last:border-b-0">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        <p className="text-[13px] text-muted-foreground">{note}</p>
      </div>
      <StatusPill tone={ok === null ? 'neutral' : ok ? 'positive' : 'danger'}>
        {ok === null ? 'Checking' : ok ? pills.up : pills.down}
      </StatusPill>
    </div>
  )
}

export function HealthCard({ health, failed }: { health: Health | null; failed: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">System Status</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          What The Server Reports Right Now. Jev Falls Back To Cached Answers When Unavailable.
        </p>
      </CardHeader>
      <CardContent>
        {row('API', failed ? false : health ? health.ok : null, 'The Bun Server And Its Routes')}
        {row('Database', failed ? false : health ? health.db : null, 'Where Your Bookings Are Stored')}
        {row('Jev', failed ? false : health ? health.jev : null, 'Whether A TypeSafe API Key Is Configured', {
          up: 'Configured',
          down: 'Missing'
        })}
      </CardContent>
    </Card>
  )
}

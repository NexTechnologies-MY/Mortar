/**
 * Status card — the server's own health report: the API itself, the database
 * connection, and whether Jev answers live. Reads `GET /api/health`; `nonce`
 * re-checks after a reset.
 */

import { useEffect, useState } from 'react'
import { fetchHealth, type Health } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusPill } from '@/components/ui/status-pill'

function row(label: string, ok: boolean | null, note: string) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-2 last:border-b-0">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        <p className="text-[13px] text-muted-foreground">{note}</p>
      </div>
      <StatusPill tone={ok === null ? 'neutral' : ok ? 'positive' : 'danger'}>
        {ok === null ? 'Checking' : ok ? 'Connected' : 'Unavailable'}
      </StatusPill>
    </div>
  )
}

export function HealthCard({ nonce = 0 }: { nonce?: number }) {
  const [health, setHealth] = useState<Health | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    fetchHealth()
      .then((h) => {
        if (alive) {
          setHealth(h)
          setFailed(false)
        }
      })
      .catch(() => {
        if (alive) setFailed(true)
      })
    return () => {
      alive = false
    }
  }, [nonce])

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
        {row('Database', failed ? false : health ? health.db : null, 'The Neon Postgres Branch Behind The Snapshot')}
        {row('Jev', failed ? false : health ? health.jev : null, 'Live Jev Answers Via The TypeSafe Key')}
      </CardContent>
    </Card>
  )
}

/**
 * Simulation badge — the header chip every app screen carries:
 * "Simulated Data · Seed 20260918 · As Of 18 Sep 2026". Seed and as-of date
 * fill in once the snapshot lands; the words "Simulated Data" are always
 * there. Compact text below the sm breakpoint.
 */

import { formatDate } from '@/components/case'
import { Badge } from '@/components/ui/badge'
import { useSnapshot } from '@/lib/data'

export function SimulationBadge() {
  const { snapshot } = useSnapshot()
  const meta = snapshot?.meta

  return (
    <Badge variant="secondary" className="h-6 whitespace-nowrap px-2 font-normal">
      <span className="hidden sm:inline">
        Simulated Data{meta ? ` · Seed ${meta.seed} · As Of ${formatDate(meta.referenceDate)}` : ''}
      </span>
      <span className="sm:hidden">Simulated Data</span>
    </Badge>
  )
}

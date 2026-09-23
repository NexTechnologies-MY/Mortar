/**
 * Non-blocking notice for any screen backed by `useSnapshot`. A mutation can
 * save fine and still have its follow-up refresh fail — the snapshot context
 * keeps the last good data and only sets `error`, so the page must not vanish
 * behind a blocking empty state (that path is reserved for a first load that
 * never lands, i.e. `error && !snapshot`). This banner is the shared "shown
 * with the data, not instead of it" notice DESIGN.md's plain-language rule
 * calls for: what happened, and one action to fix it.
 */
import { Button } from '@/components/ui/button'

export function RefreshErrorBanner({
  onRetry,
  message = 'Could Not Refresh. Showing The Last Loaded Data.'
}: {
  onRetry: () => void
  message?: string
}) {
  return (
    <div
      role="alert"
      className="mt-4 flex flex-wrap items-center gap-3 rounded-md border border-status-danger bg-status-danger-bg px-3 py-2 text-[13px] text-status-danger-fg"
    >
      <span>{message}</span>
      <Button type="button" size="sm" variant="secondary" className="ml-auto shrink-0" onClick={onRetry}>
        Try Again
      </Button>
    </div>
  )
}

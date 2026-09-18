/**
 * Renders the catch-all 404 fallback route.
 * It is reached when React Router cannot match the current URL to any app page.
 * This page serves the recovery step that sends users back to their persona home.
 */
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { FileQuestion, ArrowLeft } from 'lucide-react'

/** Renders the 404 fallback page with navigation recovery actions. */
export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      {/* Error content */}
      <div className="relative animate-fade-in-up">
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-md border border-border bg-card">
            <FileQuestion className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>

        <h1 className="font-heading text-7xl font-bold tracking-tight text-foreground sm:text-8xl">404</h1>
        <p className="mt-4 text-xl font-medium text-foreground">Page not found</p>
        <p className="mt-2 max-w-md text-muted-foreground">
          The page you are looking for does not exist or has been moved. Let us get you back on track.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link to="/">
            <Button size="lg" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

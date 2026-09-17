/**
 * Navigation theme switch for the app shell.
 * Lets users flip between resolved light and dark modes from compact header controls.
 */

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/button'

/**
 * Renders an icon-only button that switches between resolved light and dark themes.
 */
export function ThemeToggle() {
  const { resolved, toggle } = useTheme()

  return (
    <Button variant="ghost" size="icon" onClick={toggle} className="h-9 w-9" aria-label="Toggle theme">
      {resolved === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  )
}

import { useId, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent } from './card'

export function Disclosure({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <Card>
      <CardContent className="p-4">
        <Button
          variant="ghost"
          className="h-auto w-full justify-start whitespace-normal text-left"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
        >
          {open ? <ChevronDown aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
          {title}
        </Button>
        {open && (
          <div id={id} className="mt-4">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

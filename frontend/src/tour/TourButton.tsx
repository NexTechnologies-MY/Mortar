import { useState } from 'react'
import { CircleHelp } from 'lucide-react'
import { useTour } from './TourProvider'
import { PERSONAS, usePersona } from '@/lib/persona'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

export function TourButton() {
  const { active, start } = useTour()
  const { persona } = usePersona()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(persona)
  if (active) return null
  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        aria-label="Take a guided tour"
        onClick={() => {
          setSelected(persona)
          setOpen(true)
        }}
        className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] right-4 z-[90] size-9 rounded-md bg-card shadow-[var(--shadow-overlay)] sm:bottom-4"
      >
        <CircleHelp aria-hidden="true" className="size-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Take A Guided Tour?</DialogTitle>
            <DialogDescription>
              A short walk through the pages. Nothing is changed, and you can leave any time with Escape.
            </DialogDescription>
          </DialogHeader>
          <label className="text-sm font-medium" htmlFor="tour-persona">
            Choose A Persona
          </label>
          <Select value={selected} onValueChange={(value) => setSelected(value as typeof persona)}>
            <SelectTrigger id="tour-persona" aria-label="Tour persona">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERSONAS.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Not Now
            </Button>
            <Button
              type="button"
              onClick={() => {
                start(selected)
                setOpen(false)
              }}
            >
              Start Tour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

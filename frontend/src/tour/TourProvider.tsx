import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSnapshot } from '@/lib/data'
import { summarizeCases } from '@mortar/core'
import { usePersona, type Persona } from '@/lib/persona'
import { TOUR_STEPS, type TourStep } from './tourSteps'
import { Spotlight } from './Spotlight'
import { TourStepBar } from './TourStepBar'

type TourContextValue = { active: boolean; start: (persona?: Persona) => void }
const TourContext = createContext<TourContextValue>({ active: false, start: () => {} })
export const useTour = () => useContext(TourContext)

function resolveRoute(step: TourStep, snapshot: ReturnType<typeof useSnapshot>['snapshot']) {
  if (!step.route.includes(':id')) return step.route
  const summaries = snapshot
    ? summarizeCases(
        {
          bookings: snapshot.bookings,
          applications: snapshot.applications,
          events: snapshot.events,
          tasks: snapshot.tasks
        },
        snapshot.meta.referenceDate
      )
    : []
  const preferred =
    summaries.find((item) => item.stallReasons.length > 0) ??
    summaries.find((item) => !['spa_signed', 'disbursed', 'cancelled', 'lapsed'].includes(item.stage))
  const booking = snapshot?.bookings.find((item) => item.id === preferred?.bookingId)
  return booking ? `/bookings/${booking.id}` : '/bookings'
}

export function TourProvider({ children }: { children: ReactNode }) {
  const { persona, home, setPersona } = usePersona()
  const { snapshot } = useSnapshot()
  const location = useLocation()
  const navigate = useNavigate()
  const [active, setActive] = useState(false)
  const [index, setIndex] = useState(0)
  const requestedPath = useRef<string | null>(null)
  const ignorePersonaPathChange = useRef(false)
  const lastPath = useRef(location.pathname)
  const steps = TOUR_STEPS[persona]
  const step = steps[index]
  const route = step ? resolveRoute(step, snapshot) : home

  const goTo = useCallback(
    (nextIndex: number) => {
      if (nextIndex < 0 || nextIndex >= steps.length) return
      setIndex(nextIndex)
      const next = steps[nextIndex]
      const target = resolveRoute(next, snapshot)
      requestedPath.current = target
      if (location.pathname !== target) navigate(target)
    },
    [steps, snapshot, location.pathname, navigate]
  )

  const start = useCallback(
    (forPersona: Persona = persona) => {
      if (forPersona !== persona) setPersona(forPersona)
      setIndex(0)
      setActive(true)
      requestedPath.current = TOUR_STEPS[forPersona][0]?.route ?? home
      if (location.pathname !== requestedPath.current) navigate(requestedPath.current)
    },
    [persona, setPersona, home, location.pathname, navigate]
  )

  const stop = useCallback(
    (finish = false) => {
      setActive(false)
      requestedPath.current = null
      if (finish) navigate(home)
    },
    [home, navigate]
  )

  // Persona changes restart the active tour at the new persona’s first step.
  const personaRef = useRef(persona)
  useEffect(() => {
    if (personaRef.current === persona) return
    personaRef.current = persona
    if (!active) return
    ignorePersonaPathChange.current = location.pathname !== TOUR_STEPS[persona][0].route
    // A persona switch is an external state change: restart the active tour at its first step.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIndex(0)
    const firstRoute = TOUR_STEPS[persona][0].route
    requestedPath.current = firstRoute
    if (location.pathname !== firstRoute) navigate(firstRoute)
  }, [persona, active, location.pathname, navigate])

  useEffect(() => {
    if (personaRef.current !== persona) return
    if (lastPath.current === location.pathname) return
    lastPath.current = location.pathname
    if (ignorePersonaPathChange.current) {
      ignorePersonaPathChange.current = false
      return
    }
    if (active && requestedPath.current && location.pathname !== requestedPath.current) stop()
  }, [active, location.pathname, stop, persona])

  useEffect(() => {
    if (!active || !step?.route.includes(':id') || route === '/bookings' || location.pathname !== '/bookings') return
    requestedPath.current = route
    navigate(route)
  }, [active, step, route, location.pathname, navigate])

  useEffect(() => {
    if (!active) return
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target instanceof Element ? event.target : null
      if (target?.closest('input, textarea, select, [contenteditable="true"], [role="combobox"], [role="dialog"]'))
        return
      if (event.key === 'Escape') {
        event.preventDefault()
        stop()
        return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        if (index === steps.length - 1) stop(true)
        else goTo(index + 1)
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goTo(index - 1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active, index, steps.length, goTo, stop])

  const value = useMemo(() => ({ active, start }), [active, start])
  return (
    <TourContext.Provider value={value}>
      {children}
      {active && step ? (
        <>
          <TourStepBar steps={steps} index={index} onGoTo={goTo} onEnd={() => stop()} />
          <Spotlight
            key={`${persona}-${index}`}
            step={step}
            onBack={() => goTo(index - 1)}
            onNext={() => (index === steps.length - 1 ? stop(true) : goTo(index + 1))}
            canBack={index > 0}
            last={index === steps.length - 1}
          />
        </>
      ) : null}
    </TourContext.Provider>
  )
}

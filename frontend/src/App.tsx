/**
 * Declares the top-level React Router shell for Mortar.
 * `/` redirects to the active persona's home route; every app page renders inside AppShell.
 */
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { usePersona } from './lib/persona'
import { BookingsPage } from './pages/BookingsPage'
import { BookingDetailPage } from './pages/BookingDetailPage'
import { ChasePage } from './pages/ChasePage'
import { ForecastPage } from './pages/ForecastPage'
import { ImportPage } from './pages/ImportPage'
import { NotFoundPage } from './pages/NotFoundPage'

/** Sends `/` to the current persona's home route. */
function HomeRedirect() {
  const { home } = usePersona()
  return <Navigate to={home} replace />
}

/**
 * Sets up the app router. The router is mounted under AppErrorBoundary in
 * frontend/src/main.tsx so route crashes show the recovery UI.
 */
export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route element={<AppShell />}>
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/bookings/:id" element={<BookingDetailPage />} />
        <Route path="/chase" element={<ChasePage />} />
        <Route path="/forecast" element={<ForecastPage />} />
        <Route path="/import" element={<ImportPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

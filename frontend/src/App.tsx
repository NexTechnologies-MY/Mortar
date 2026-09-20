/**
 * Declares the top-level React Router shell for Mortar.
 * `/` is the landing and `/app` redirects to the active persona's home route.
 * Only the public pages sit inside PublicShell, which adds the site footer; the
 * app routes, the 404 and `/sign-in` render without one.
 */
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { PublicShell } from './components/layout/PublicShell'
import { usePersona } from './lib/persona'
import { BookingsPage } from './pages/BookingsPage'
import { BookingDetailPage } from './pages/BookingDetailPage'
import { ChasePage } from './pages/ChasePage'
import { FaqPage } from './pages/FaqPage'
import { ForecastPage } from './pages/ForecastPage'
import { ImportPage } from './pages/ImportPage'
import { LandingPage } from './pages/LandingPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SettingsPage } from './pages/SettingsPage'
import { SignInPage } from './pages/SignInPage'

/** Sends `/app` to the current persona's home route. */
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
      <Route element={<PublicShell />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/faq" element={<FaqPage />} />
      </Route>
      <Route path="/app" element={<HomeRedirect />} />
      <Route element={<AppShell />}>
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/bookings/:id" element={<BookingDetailPage />} />
        <Route path="/chase" element={<ChasePage />} />
        <Route path="/forecast" element={<ForecastPage />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/sign-in" element={<SignInPage />} />
    </Routes>
  )
}

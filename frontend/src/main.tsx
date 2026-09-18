/**
 * Boots the React frontend into the root DOM node.
 * This file is reached once by Vite in the browser and wires the providers that all routes depend on.
 * It serves the app shell step by mounting routing, theme, persona, toast, and error boundaries.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppErrorBoundary } from './components/layout/AppErrorBoundary'
import { ScrollToTop } from './components/layout/ScrollToTop'
import { ThemeProvider } from './hooks/useTheme'
import { PersonaProvider } from './lib/persona'
import { App } from './App'
import './globals.css'

// Recharts' ResponsiveContainer + Radix dropdown's pointer-event tracking
// occasionally surface benign ResizeObserver loop warnings and null-reason
// rejections during dropdown open/close. They're harmless but get caught
// by SES lockdown loggers and spam the console as
// `SES_UNCAUGHT_EXCEPTION: null`. Filter them at the source.
window.addEventListener('error', (event) => {
  if (event.message?.includes('ResizeObserver loop')) {
    event.preventDefault()
    event.stopImmediatePropagation()
  }
})
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason
  const message = typeof reason?.message === 'string' ? reason.message : ''
  if (reason == null || message.includes('ResizeObserver loop')) {
    event.preventDefault()
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <ThemeProvider>
          <PersonaProvider>
            <App />
            <Toaster position="bottom-center" toastOptions={{ duration: 4000 }} />
          </PersonaProvider>
        </ThemeProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  </StrictMode>
)

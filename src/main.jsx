import { useTranslation } from 'react-i18next';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import ErrorBoundary from './shared/components/ErrorBoundary'
import './index.css'
import './i18n' // Initialize i18n before rendering
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)

// ── Register Service Worker for PWA Offline Mode (production only) ───────────
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('[SW] Registered:', reg.scope)
        // Check for updates periodically
        setInterval(() => reg.update(), 60000)
      })
      .catch(err => console.warn('[SW] Registration failed:', err))
  })
} else if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.unregister())
  })
}

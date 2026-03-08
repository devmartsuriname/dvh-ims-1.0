import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { basePath } from './context/constants.ts'

// Sentry initialization (must be first — captures all subsequent errors)
import { initSentry } from './lib/sentry'
initSentry()

// Health signal (fires once when Sentry is active)
import { emitSystemReady } from './lib/health'
emitSystemReady()

// i18n configuration (must be imported before App)
import './i18n/config'

// Darkone React Template SCSS (primary styles)
import './assets/scss/style.scss'

// React Toastify base CSS (required for proper notification rendering)
import 'react-toastify/dist/ReactToastify.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basePath}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
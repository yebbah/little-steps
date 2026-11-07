import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/tokens.css'
import './styles/base.css'
import { startInstallTracking } from './pwa/install.ts'
import { applyTheme, readThemeChoice } from './styles/theme.ts'

startInstallTracking()
// index.html applies the stored choice before first paint; this also brings the browser bar colour in line.
applyTheme(readThemeChoice())

// The service worker is for production builds only; the dev server and test-mode builds (the gallery) run without one.
if (import.meta.env.PROD && import.meta.env.MODE === 'production') void import('./pwa/register.ts').then(({ registerServiceWorker }) => registerServiceWorker()).catch(() => {})

const root = createRoot(document.getElementById('root')!)

// The gallery route is registered only when VITE_ENABLE_GALLERY=true (dev and test modes). A production
// build replaces the flag with 'false', so this branch and the gallery chunk are dropped from the bundle.
if (import.meta.env.VITE_ENABLE_GALLERY === 'true' && location.pathname === '/dev/gallery') {
  void import('./gallery/Gallery.tsx')
    .then(({ Gallery }) =>
      root.render(
        <StrictMode>
          <Gallery />
        </StrictMode>,
      ),
    )
    .catch(() => root.render(<App />))
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

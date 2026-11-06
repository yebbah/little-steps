import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/tokens.css'
import './styles/base.css'

const root = createRoot(document.getElementById('root')!)

// The gallery route is registered only when VITE_ENABLE_GALLERY=true (dev and test modes). A production
// build replaces the flag with 'false', so this branch and the gallery chunk are dropped from the bundle.
if (import.meta.env.VITE_ENABLE_GALLERY === 'true' && location.pathname === '/dev/gallery') {
  void import('./gallery/Gallery.tsx').then(({ Gallery }) =>
    root.render(
      <StrictMode>
        <Gallery />
      </StrictMode>,
    ),
  )
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

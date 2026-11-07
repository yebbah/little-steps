import { readFileSync } from 'node:fs'
import type { ManifestOptions, VitePWAOptions } from 'vite-plugin-pwa'

// The web app manifest and the service worker rules (Story 2.8). Kept in one module so a test can read
// exactly what the build uses. Colours come from tokens.css, never retyped here.
const tokens = readFileSync(new URL('./src/styles/tokens.css', import.meta.url), 'utf8')
const token = (name: string): string => {
  const hex = tokens.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})\\s*;`))?.[1]
  if (!hex) throw new Error(`token --${name} not found in tokens.css`)
  return hex
}

export const manifest: Partial<ManifestOptions> = {
  name: 'LittleSteps',
  short_name: 'LittleSteps',
  description: 'A calm place to practise small steps at home.',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  theme_color: token('floor'),
  background_color: token('floor'),
  icons: [
    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    { src: '/icons/app-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
  ],
}

/**
 * The service worker precaches the app shell only (AD-23): the built HTML, scripts, styles and icons.
 * There is no runtime caching, so no API response is ever stored, and API and actuator paths never
 * fall back to the shell page. A new worker waits (`prompt`), so it takes over on the next open and a
 * draft in progress is never reloaded under the Caregiver.
 */
export const pwa: Partial<VitePWAOptions> = {
  registerType: 'prompt',
  injectRegister: false,
  includeAssets: ['icons/apple-touch-icon.png'],
  manifest,
  workbox: {
    globPatterns: ['**/*.{html,js,css,svg,png,webmanifest}'],
    navigateFallback: '/index.html',
    navigateFallbackDenylist: [/^\/api(\/|$)/, /^\/actuator(\/|$)/],
    runtimeCaching: [],
    cleanupOutdatedCaches: true,
  },
}

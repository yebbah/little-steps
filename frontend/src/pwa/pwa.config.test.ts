import { existsSync, readFileSync } from 'node:fs'
import { expect, test } from 'vitest'
import { manifest, pwa } from '../../pwa.config.ts'

const root = `${import.meta.dirname}/../..`
const tokens = readFileSync(`${root}/src/styles/tokens.css`, 'utf8')
const token = (name: string) => tokens.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`))![1]

test('the manifest names the app, runs standalone and takes its colours from the tokens', () => {
  expect(manifest.name).toBe('LittleSteps')
  expect(manifest.short_name).toBe('LittleSteps')
  expect(manifest.display).toBe('standalone')
  expect(manifest.theme_color).toBe(token('floor'))
  expect(manifest.background_color).toBe(token('floor'))
  expect(manifest.start_url).toBe('/')
})

test('the manifest has the icon sizes browsers need, and every icon file exists', () => {
  const sizes = manifest.icons!.map((icon) => icon.sizes)
  expect(sizes).toEqual(expect.arrayContaining(['192x192', '512x512', 'any']))
  expect(manifest.icons!.some((icon) => icon.purpose === 'maskable')).toBe(true)
  for (const icon of manifest.icons!) expect(existsSync(`${root}/public${icon.src}`), icon.src).toBe(true)
})

test('each PNG icon has the size the manifest says', () => {
  for (const icon of manifest.icons!.filter((i) => i.type === 'image/png')) {
    const png = readFileSync(`${root}/public${icon.src}`)
    const [w, h] = [png.readUInt32BE(16), png.readUInt32BE(20)]
    expect(`${w}x${h}`, icon.src).toBe(icon.sizes)
  }
})

test('the app icon is a simple drawing kept as SVG: no text, no images, no faces, no shadows', () => {
  const svg = readFileSync(`${root}/public/icons/app-icon.svg`, 'utf8').replace(/<!--[\s\S]*?-->/g, '')
  expect(svg).not.toMatch(/<text|<image|<circle|<ellipse|<filter|<path|shadow/i)
  expect(svg).toMatch(/<rect/)
})

test('the service worker precaches the shell only: no runtime caching, API and actuator never fall back to the page', () => {
  expect(pwa.workbox).toBeDefined()
  const workbox = pwa.workbox as { runtimeCaching?: unknown[]; navigateFallbackDenylist?: RegExp[]; globPatterns?: string[] }
  expect(workbox.runtimeCaching).toEqual([])
  const deny = workbox.navigateFallbackDenylist!
  expect(deny.some((rule) => rule.test('/api/families'))).toBe(true)
  expect(deny.some((rule) => rule.test('/actuator/health'))).toBe(true)
  expect(deny.some((rule) => rule.test('/goals'))).toBe(false)
  expect(workbox.globPatterns!.join()).not.toMatch(/json/)
})

test('a new version waits instead of taking over, so no draft is reloaded under the Caregiver', () => {
  expect(pwa.registerType).toBe('prompt')
  expect(pwa.workbox).not.toHaveProperty('skipWaiting', true)
  expect(pwa.workbox).not.toHaveProperty('clientsClaim', true)
})

test('the theme-colour metas and the icon fills are token values', () => {
  const html = readFileSync(`${root}/index.html`, 'utf8')
  const metas = [...html.matchAll(/<meta name="theme-color" content="(#[0-9A-Fa-f]{6})"/g)].map((m) => m[1])
  expect(metas).toEqual([token('floor'), token('floor-dark')])
  const svg = readFileSync(`${root}/public/icons/app-icon.svg`, 'utf8')
  const allowed = new Set(
    ['action', 'domain-communication', 'domain-motor-imitation', 'domain-play'].map((name) => token(name).toUpperCase()),
  )
  for (const [, fill] of svg.matchAll(/fill="(#[0-9A-Fa-f]{6})"/g)) expect(allowed.has(fill.toUpperCase()), fill).toBe(true)
})

test('the inline theme script sets the browser bar to the floor tokens', () => {
  const html = readFileSync(`${root}/index.html`, 'utf8')
  const script = html.slice(html.indexOf('<script>'), html.indexOf('</script>'))
  expect(script).toContain(`'${token('floor-dark')}'`)
  expect(script).toContain(`'${token('floor')}'`)
})

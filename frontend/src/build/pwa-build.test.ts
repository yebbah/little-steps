import { mkdtempSync, readFileSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { build } from 'vite'
import { expect, test } from 'vitest'

// AD-23 (Story 2.8): the built service worker precaches the shell only and never an API response.

test('[P0] the production build emits a manifest and a service worker that precache the shell only', async () => {
  const outDir = mkdtempSync(join(tmpdir(), 'littlesteps-pwa-'))
  await build({ mode: 'production', logLevel: 'silent', build: { outDir, emptyOutDir: true } })

  const manifest = JSON.parse(readFileSync(join(outDir, 'manifest.webmanifest'), 'utf8')) as { name: string; display: string }
  expect(manifest.name).toBe('LittleSteps')
  expect(manifest.display).toBe('standalone')

  const html = readFileSync(join(outDir, 'index.html'), 'utf8')
  expect(html).toContain('rel="manifest"')

  const sw = readFileSync(join(outDir, 'sw.js'), 'utf8')
  const precached = [...sw.matchAll(/"?url"?:\s*"([^"]+)"/g)].map((m) => m[1])
  expect(precached).toContain('index.html')
  expect(precached.every((url) => !/api|actuator/.test(url))).toBe(true)
  // No runtime caching strategy is registered, so no response is stored as it is fetched.
  expect(sw).not.toMatch(/NetworkFirst|CacheFirst|StaleWhileRevalidate|NetworkOnly/)
  // API and actuator paths never fall back to the shell page.
  expect(sw).toMatch(/denylist:\s*\[[^\]]*api[^\]]*actuator/)
  expect(readdirSync(outDir)).toContain('icons')
}, 120_000)

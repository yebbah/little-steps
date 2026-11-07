import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { build } from 'vite'
import { afterAll, expect, test } from 'vitest'

// AD-23 (Story 2.8): the built service worker precaches the shell only and never an API response.

const outDirs: string[] = []
afterAll(() => outDirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })))

test('[P0] the production build emits a manifest and a service worker that precache the shell only', async () => {
  const outDir = mkdtempSync(join(tmpdir(), 'littlesteps-pwa-'))
  outDirs.push(outDir)
  // Vitest sets NODE_ENV=test, which would make the bundle think it is not a production build.
  const previous = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'
  try {
    await build({ mode: 'production', logLevel: 'silent', build: { outDir, emptyOutDir: true } })
  } finally {
    process.env.NODE_ENV = previous
  }

  const manifest = JSON.parse(readFileSync(join(outDir, 'manifest.webmanifest'), 'utf8')) as { name: string; display: string }
  expect(manifest.name).toBe('LittleSteps')
  expect(manifest.display).toBe('standalone')

  const html = readFileSync(join(outDir, 'index.html'), 'utf8')
  expect(html).toContain('rel="manifest"')

  const sw = readFileSync(join(outDir, 'sw.js'), 'utf8')
  const precached = [...sw.matchAll(/"?url"?:\s*"([^"]+)"/g)].map((m) => m[1])
  expect(precached).toContain('index.html')
  // No precached URL is an API or actuator path (a whole path segment, so a name like "rapid" is fine).
  expect(precached.every((url) => !/^\/?(api|actuator)(\/|$)/.test(url))).toBe(true)
  // The bundle registers the worker, so the offline shell and the update signal are really wired in.
  const scripts = readdirSync(join(outDir, 'assets')).filter((name) => name.endsWith('.js'))
  const code = scripts.map((name) => readFileSync(join(outDir, 'assets', name), 'utf8')).join('\n')
  expect(code).toMatch(/serviceWorker/)
  expect(code).toMatch(/sw\.js/)
  // No runtime caching strategy is registered, so no response is stored as it is fetched.
  expect(sw).not.toMatch(/NetworkFirst|CacheFirst|StaleWhileRevalidate|NetworkOnly/)
  // API and actuator paths never fall back to the shell page.
  expect(sw).toMatch(/denylist:\s*\[[^\]]*api[^\]]*actuator/)
  expect(readdirSync(outDir)).toContain('icons')
}, 120_000)

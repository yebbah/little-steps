import { build, type Rollup } from 'vite'
import { expect, test } from 'vitest'

// R-01 (Story 2.1): the component gallery exists only in local and test builds.

const GALLERY_ROUTE = '/dev/gallery'

async function bundleText(mode: string, enableGallery: boolean): Promise<string> {
  const previous = process.env.VITE_ENABLE_GALLERY
  if (enableGallery) process.env.VITE_ENABLE_GALLERY = 'true'
  else delete process.env.VITE_ENABLE_GALLERY
  try {
    const result = await build({ mode, logLevel: 'silent', build: { write: false } })
    const outputs = (Array.isArray(result) ? result : [result]) as Rollup.RollupOutput[]
    return outputs
      .flatMap((o) => o.output)
      .map((chunk) => ('code' in chunk ? chunk.code : String(chunk.source)))
      .join('\n')
  } finally {
    if (previous === undefined) delete process.env.VITE_ENABLE_GALLERY
    else process.env.VITE_ENABLE_GALLERY = previous
  }
}

test('[P0] AC-1 the gallery route is in the test-mode bundle and absent from the production bundle', async () => {
  // When both bundles are built, the same way CI builds them
  const testBundle = await bundleText('test', true)
  const productionBundle = await bundleText('production', false)

  // Then the gallery is registered only where VITE_ENABLE_GALLERY=true (criterion-defining assertion first)
  expect(testBundle).toContain(GALLERY_ROUTE)
  expect(productionBundle).not.toContain(GALLERY_ROUTE)
  expect(productionBundle).not.toMatch(/gallery/i)
}, 120_000)

test('[P0] AC-1 a production build ignores VITE_ENABLE_GALLERY=true set in the environment', async () => {
  // Given a person (or a CI job) sets the flag by mistake
  const bundle = await bundleText('production', true)

  // Then the production bundle still has no gallery
  expect(bundle).not.toContain(GALLERY_ROUTE)
  expect(bundle).not.toMatch(/gallery/i)
}, 120_000)

test('[P0] AC-1 a build in any mode other than development and test ignores the flag (staging)', async () => {
  const bundle = await bundleText('staging', true)

  expect(bundle).not.toContain(GALLERY_ROUTE)
  expect(bundle).not.toMatch(/gallery/i)
}, 120_000)

// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { expect, test, vi } from 'vitest'

const { stop, start } = vi.hoisted(() => {
  const stop = vi.fn()
  return { stop, start: vi.fn(() => stop) }
})
vi.mock('./data/index.ts', async (original) => ({ ...(await original<typeof import('./data/index.ts')>()), startDataLayer: start }))

import App from './App.tsx'

test('the app starts the data layer on mount and stops it on unmount', () => {
  const view = render(<App />)
  expect(start).toHaveBeenCalledTimes(1)
  view.unmount()
  expect(stop).toHaveBeenCalledTimes(1)
})

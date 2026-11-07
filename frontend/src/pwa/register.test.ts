// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest'
import { resetUpdate } from './update.ts'

// The registration wires the service worker's "new version waiting" signal to the update hook.
const registerSW = vi.fn()
vi.mock('virtual:pwa-register', () => ({ registerSW: (options: unknown) => registerSW(options) }))

afterEach(() => {
  resetUpdate()
  registerSW.mockReset()
  vi.unstubAllGlobals()
})

test('a waiting version is reported to the update hook and applied only when asked', async () => {
  const updateSW = vi.fn()
  registerSW.mockReturnValue(updateSW)
  vi.stubGlobal('navigator', { ...navigator, serviceWorker: {} })
  const { registerServiceWorker } = await import('./register.ts')
  const { useAppUpdate } = await import('./update.ts')
  const { renderHook, act } = await import('@testing-library/react')

  const hook = renderHook(() => useAppUpdate())
  registerServiceWorker()
  expect(hook.result.current.updateReady).toBe(false)
  act(() => (registerSW.mock.calls[0][0] as { onNeedRefresh: () => void }).onNeedRefresh())
  expect(hook.result.current.updateReady).toBe(true)
  expect(updateSW).not.toHaveBeenCalled()
  act(() => hook.result.current.applyUpdate())
  expect(updateSW).toHaveBeenCalledWith(true)
})

test('a registration failure is swallowed and a browser without service workers registers nothing', async () => {
  const { registerServiceWorker } = await import('./register.ts')
  vi.stubGlobal('navigator', {})
  registerServiceWorker()
  expect(registerSW).not.toHaveBeenCalled()
  vi.stubGlobal('navigator', { serviceWorker: {} })
  registerSW.mockReturnValue(vi.fn())
  registerServiceWorker()
  expect(() => (registerSW.mock.calls[0][0] as { onRegisterError: (e: unknown) => void }).onRegisterError(new Error('x'))).not.toThrow()
})

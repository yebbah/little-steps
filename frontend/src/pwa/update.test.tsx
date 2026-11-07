// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vitest'
import { markUpdateReady, resetUpdate, useAppUpdate } from './update.ts'

const APPLY = 'apply'

function Probe() {
  const { updateReady, applyUpdate } = useAppUpdate()
  return (
    <>
      <p>{updateReady ? 'ready' : 'none'}</p>
      <button onClick={applyUpdate}>{APPLY}</button>
    </>
  )
}

afterEach(() => resetUpdate())

test('with no waiting version the hook reports none and applying does nothing', async () => {
  render(<Probe />)
  expect(screen.getByText('none')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: APPLY }))
  expect(screen.getByText('none')).toBeInTheDocument()
})

test('a waiting version is reported but is not applied on its own', () => {
  const apply = vi.fn()
  render(<Probe />)
  act(() => markUpdateReady(apply))
  expect(screen.getByText('ready')).toBeInTheDocument()
  expect(apply).not.toHaveBeenCalled()
})

test('applying reloads onto the waiting version only when the feature asks', async () => {
  const apply = vi.fn()
  render(<Probe />)
  act(() => markUpdateReady(apply))
  await userEvent.click(screen.getByRole('button', { name: APPLY }))
  expect(apply).toHaveBeenCalledOnce()
})

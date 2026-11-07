// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { Banner, Notices } from './Banner.tsx'
import { firstWords } from './firstWords.ts'

const OFFLINE = 'Saved on this device — will sync.'

test('a banner with no action and no dismiss shows only its message', () => {
  render(<Banner message={OFFLINE} />)
  expect(screen.getByText(OFFLINE)).toBeInTheDocument()
  expect(screen.queryByRole('button')).toBeNull()
})

test('a dismissable banner names its dismiss button with the first words of the message', async () => {
  const onDismiss = vi.fn()
  render(<Banner message={OFFLINE} onDismiss={onDismiss} />)
  const button = screen.getByRole('button', { name: 'Dismiss notice: Saved on this device' })
  await userEvent.click(button)
  expect(onDismiss).toHaveBeenCalledOnce()
})

test('a banner shows its one action and a dismiss button, and the action calls its handler', async () => {
  const onAction = vi.fn()
  render(<Banner message="Earlier practice is still open." action={{ label: 'Review it', onAction }} onDismiss={() => {}} />)
  await userEvent.click(screen.getByRole('button', { name: 'Review it' }))
  expect(onAction).toHaveBeenCalledOnce()
  expect(screen.getAllByRole('button')).toHaveLength(2)
})

test('banners stack newest first inside a "Notices" region', () => {
  render(
    <Notices
      notices={[
        { id: 'a', message: 'First notice' },
        { id: 'b', message: 'Second notice' },
        { id: 'c', message: 'Third notice' },
      ]}
    />,
  )
  const region = screen.getByRole('region', { name: 'Notices' })
  const items = within(region).getAllByRole('listitem')
  expect(items.map((item) => item.textContent)).toEqual(['Third notice', 'Second notice', 'First notice'])
})

test('with no notices there is no region', () => {
  render(<Notices notices={[]} />)
  expect(screen.queryByRole('region')).toBeNull()
})

test('a notice never blocks the screen: the stylesheet keeps it in normal flow', () => {
  const css = readFileSync(`${import.meta.dirname}/Banner.module.css`, 'utf8')
  expect(css).not.toMatch(/position:\s*(fixed|absolute|sticky)/)
})

test('first words handles short, padded and empty text', () => {
  expect(firstWords('One two')).toBe('One two')
  expect(firstWords('  one   two three four five  ')).toBe('one two three four')
  expect(firstWords('')).toBe('')
  expect(firstWords('x'.repeat(200))).toHaveLength(40)
})

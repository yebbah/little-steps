// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { Button } from './Button.tsx'

const SAVE = 'Save'

test('an enabled button calls onClick on click, Enter and Space', async () => {
  const onClick = vi.fn()
  render(<Button onClick={onClick}>{SAVE}</Button>)
  const button = screen.getByRole('button', { name: 'Save' })
  await userEvent.click(button)
  button.focus()
  await userEvent.keyboard('{Enter}')
  await userEvent.keyboard(' ')
  expect(onClick).toHaveBeenCalledTimes(3)
})

test('a disabled button is aria-disabled, never native disabled, keeps focus and ignores every press', async () => {
  const onClick = vi.fn()
  render(
    <Button disabled onClick={onClick}>
      {SAVE}
    </Button>,
  )
  const button = screen.getByRole('button', { name: 'Save' })
  expect(button).toHaveAttribute('aria-disabled', 'true')
  expect(button).not.toBeDisabled()

  await userEvent.click(button)
  expect(button).toHaveFocus()
  await userEvent.keyboard('{Enter}')
  await userEvent.keyboard(' ')
  expect(onClick).not.toHaveBeenCalled()
  expect(button).toHaveFocus()
})

test('a disabled submit button does not submit its form', async () => {
  const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault())
  render(
    <form onSubmit={onSubmit}>
      <Button type="submit" disabled>
        {SAVE}
      </Button>
    </form>,
  )
  await userEvent.click(screen.getByRole('button', { name: 'Save' }))
  expect(onSubmit).not.toHaveBeenCalled()
})

test('every variant renders a button of type "button" by default', () => {
  render(
    <>
      {(['primary', 'secondary', 'quiet', 'danger'] as const).map((variant) => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </>,
  )
  for (const button of screen.getAllByRole('button')) expect(button).toHaveAttribute('type', 'button')
})

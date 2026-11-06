// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { expect, test } from 'vitest'
import { PairedStepper, Stepper } from './Stepper.tsx'

function Single({ start = 0 as number | undefined, max }: { start?: number | undefined; max?: number }) {
  const [value, setValue] = useState<number | undefined>(start)
  return (
    <Stepper label="Minutes" value={value} onChange={setValue} max={max} decrementLabel="Fewer minutes" incrementLabel="More minutes" />
  )
}

function Paired({ succeeded = 4 as number | undefined, tried = 5 as number | undefined }) {
  const [state, setState] = useState({ succeeded, tried })
  return (
    <PairedStepper
      legend="Trials"
      succeededLabel="Succeeded"
      triedLabel="Tried"
      succeeded={state.succeeded}
      tried={state.tried}
      onChange={setState}
      labels={{ fewerSucceeded: 'Fewer succeeded', moreSucceeded: 'More succeeded', fewerTried: 'Fewer tried', moreTried: 'More tried' }}
    />
  )
}

const input = (name: string) => screen.getByRole('spinbutton', { name })

test('at the minimum, "−" stays 0, is aria-disabled, keeps focus, and the field reads "0, minimum"', async () => {
  render(<Single />)
  const minus = screen.getByRole('button', { name: 'Fewer minutes' })
  expect(minus).toHaveAttribute('aria-disabled', 'true')
  expect(minus).not.toBeDisabled()
  expect(input('Minutes')).toHaveAttribute('aria-valuetext', '0, minimum')

  minus.focus()
  await userEvent.keyboard('{Enter}')
  await userEvent.click(minus)
  expect(input('Minutes')).toHaveValue(0)
  expect(minus).toHaveFocus()
})

test('"+" and "−" step the value and the minimum text goes away above 0', async () => {
  render(<Single />)
  await userEvent.click(screen.getByRole('button', { name: 'More minutes' }))
  await userEvent.click(screen.getByRole('button', { name: 'More minutes' }))
  expect(input('Minutes')).toHaveValue(2)
  expect(input('Minutes')).not.toHaveAttribute('aria-valuetext')
  await userEvent.click(screen.getByRole('button', { name: 'Fewer minutes' }))
  expect(input('Minutes')).toHaveValue(1)
})

test('typed entries: a negative clamps to 0, an empty field is empty, non-digits are dropped', async () => {
  render(<Single start={3} />)
  const field = input('Minutes')
  await userEvent.clear(field)
  expect(field).toHaveValue(null)
  await userEvent.type(field, '-3')
  expect(field).toHaveValue(0)
  await userEvent.clear(field)
  await userEvent.type(field, 'abc')
  expect(field).toHaveValue(null)
  await userEvent.type(field, '4x2')
  expect(field).toHaveValue(42)
})

test('from an empty field "+" starts at 1 and "−" is aria-disabled', async () => {
  render(<Single start={undefined} />)
  expect(screen.getByRole('button', { name: 'Fewer minutes' })).toHaveAttribute('aria-disabled', 'true')
  await userEvent.click(screen.getByRole('button', { name: 'More minutes' }))
  expect(input('Minutes')).toHaveValue(1)
})

test('there is no live region', () => {
  const { container } = render(<Paired />)
  expect(container.querySelector('[aria-live], [role="status"], [role="alert"]')).toBeNull()
})

test('paired: Succeeded over Tried shows the inline message, linked, and is not committed', async () => {
  render(<Paired succeeded={2} tried={5} />)
  const succeeded = input('Succeeded')
  await userEvent.clear(succeeded)
  await userEvent.type(succeeded, '7')

  const message = screen.getByText("Can't be more than 5 tried")
  expect(succeeded).toHaveAttribute('aria-describedby', message.id)
  expect(succeeded).toHaveAttribute('aria-invalid', 'true')
  expect(screen.getByRole('button', { name: 'More succeeded' })).toHaveAttribute('aria-disabled', 'true')

  // A valid entry replaces the held one and the message clears.
  await userEvent.clear(succeeded)
  await userEvent.type(succeeded, '3')
  expect(screen.queryByText("Can't be more than 5 tried")).toBeNull()
  expect(succeeded).toHaveValue(3)
})

test('paired: lowering Tried below Succeeded shows the same message and "+" on Succeeded is aria-disabled at Tried', async () => {
  render(<Paired succeeded={4} tried={4} />)
  expect(screen.getByRole('button', { name: 'More succeeded' })).toHaveAttribute('aria-disabled', 'true')
  expect(input('Succeeded')).toHaveAttribute('aria-valuetext', '4, maximum')

  await userEvent.click(screen.getByRole('button', { name: 'Fewer tried' }))
  expect(screen.getByText("Can't be more than 3 tried")).toBeInTheDocument()
  expect(input('Succeeded')).toHaveAttribute('aria-invalid', 'true')

  await userEvent.click(screen.getByRole('button', { name: 'Fewer succeeded' }))
  expect(screen.queryByText(/Can't be more than/)).toBeNull()
  expect(input('Succeeded')).toHaveValue(3)
})

test('paired: raising Tried clears the message and commits the held entry', async () => {
  render(<Paired succeeded={2} tried={5} />)
  const succeeded = input('Succeeded')
  await userEvent.clear(succeeded)
  await userEvent.type(succeeded, '7')
  expect(screen.getByText("Can't be more than 5 tried")).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'More tried' }))
  await userEvent.click(screen.getByRole('button', { name: 'More tried' }))
  expect(screen.queryByText(/Can't be more than/)).toBeNull()
  expect(succeeded).toHaveValue(7)
})

test('paired is a fieldset named by its legend', () => {
  render(<Paired />)
  expect(screen.getByRole('group', { name: 'Trials' })).toBeInTheDocument()
})

test('a decimal entry is truncated, not mangled', async () => {
  render(<Single start={undefined} />)
  await userEvent.type(input('Minutes'), '2.5')
  expect(input('Minutes')).toHaveValue(2)
})

test('a held over-limit entry is not announced as "maximum"', async () => {
  render(<Paired succeeded={2} tried={5} />)
  await userEvent.clear(input('Succeeded'))
  await userEvent.type(input('Succeeded'), '5')
  expect(input('Succeeded')).toHaveAttribute('aria-valuetext', '5, maximum')
  await userEvent.type(input('Succeeded'), '0')
  expect(input('Succeeded')).toHaveValue(50)
  expect(input('Succeeded')).not.toHaveAttribute('aria-valuetext')
})

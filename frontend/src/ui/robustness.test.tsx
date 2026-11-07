// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { expect, test, vi } from 'vitest'
import { Button } from './Button.tsx'
import { ChoiceChips } from './ChoiceChips.tsx'
import { Stepper } from './Stepper.tsx'
import { TextField } from './TextField.tsx'
import { DomainTag } from '../domain/DomainTag.tsx'

// Epic 2 code review: edge cases of the controls.

const RESET = 'reset'
const OTHER = 'Other'
const SAVE = 'Save'
const MINUTES = 'Minutes'

function Controlled({ max }: { max?: number }) {
  const [value, setValue] = useState<number | undefined>(0)
  return (
    <>
      <Stepper label={MINUTES} value={value} onChange={setValue} max={max} maxMessage="Too many" decrementLabel="Fewer" incrementLabel="More" />
      <button onClick={() => setValue(2)}>{RESET}</button>
    </>
  )
}

test('a held over-limit entry is dropped when the caller sets the value itself', async () => {
  render(<Controlled max={5} />)
  fireEvent.change(screen.getByRole('spinbutton', { name: MINUTES }), { target: { value: '9' } })
  expect(screen.getByText('Too many')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: RESET }))
  expect(screen.getByRole('spinbutton', { name: MINUTES })).toHaveValue(2)
  expect(screen.queryByText('Too many')).toBeNull()
})

test('"+" on an empty field whose ceiling is 0 stays disabled and does not create an over-limit entry', async () => {
  function Empty() {
    const [value, setValue] = useState<number | undefined>(undefined)
    return <Stepper label={MINUTES} value={value} onChange={setValue} max={0} maxMessage="Too many" decrementLabel="Fewer" incrementLabel="More" />
  }
  render(<Empty />)
  const more = screen.getByRole('button', { name: 'More' })
  expect(more).toHaveAttribute('aria-disabled', 'true')
  await userEvent.click(more)
  expect(screen.queryByText('Too many')).toBeNull()
})

test('an absurd typed number is capped before it reaches the caller', () => {
  const onChange = vi.fn()
  render(<Stepper label={MINUTES} value={0} onChange={onChange} decrementLabel="Fewer" incrementLabel="More" />)
  fireEvent.change(screen.getByRole('spinbutton', { name: MINUTES }), { target: { value: '1e20' } })
  expect(onChange).toHaveBeenLastCalledWith(9999)
})

test('a disabled button does not let the press reach an ancestor, and a caller aria-disabled is kept', async () => {
  const parent = vi.fn()
  render(
    <div onClick={parent}>
      <Button disabled>{SAVE}</Button>
      <Button aria-disabled="true">{OTHER}</Button>
    </div>,
  )
  await userEvent.click(screen.getByRole('button', { name: SAVE }))
  expect(parent).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: OTHER })).toHaveAttribute('aria-disabled', 'true')
})

test('a text field keeps a caller aria-invalid when it has no error of its own', () => {
  render(<TextField label="Note" aria-invalid="true" />)
  expect(screen.getByLabelText('Note')).toHaveAttribute('aria-invalid', 'true')
})

test('multi-select chips tolerate a missing value from untyped caller state', async () => {
  const onChange = vi.fn()
  render(<ChoiceChips mode="multi" legend="Help" options={[{ value: 'a', label: 'A' }]} value={undefined as unknown as string[]} onChange={onChange} />)
  await userEvent.click(screen.getByRole('checkbox', { name: 'A' }))
  expect(onChange).toHaveBeenCalledWith(['a'])
})

test('a Domain tag with no name shows nothing instead of an empty colour pill', () => {
  const { container } = render(<DomainTag domain="   " />)
  expect(container).toBeEmptyDOMElement()
})

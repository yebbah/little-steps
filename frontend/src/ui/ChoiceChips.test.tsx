// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { expect, test } from 'vitest'
import { ChoiceChips } from './ChoiceChips.tsx'

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma' },
]

function Single() {
  const [value, setValue] = useState<string | undefined>('a')
  return <ChoiceChips mode="single" legend="Pick one" options={options} value={value} onChange={setValue} />
}

function Multi() {
  const [value, setValue] = useState<string[]>(['a'])
  return <ChoiceChips mode="multi" legend="Pick any" options={options} value={value} onChange={setValue} />
}

test('single select is a radio group in a labelled fieldset; arrow keys move the selection with focus', async () => {
  render(<Single />)
  expect(screen.getByRole('group', { name: 'Pick one' })).toBeInTheDocument()
  expect(screen.getByRole('radio', { name: 'Alpha' })).toBeChecked()

  screen.getByRole('radio', { name: 'Alpha' }).focus()
  await userEvent.keyboard('{ArrowRight}')
  expect(screen.getByRole('radio', { name: 'Beta' })).toBeChecked()
  expect(screen.getByRole('radio', { name: 'Beta' })).toHaveFocus()
  expect(screen.getAllByRole('radio').filter((r) => (r as HTMLInputElement).checked)).toHaveLength(1)
})

test('multi select is checkboxes; Space toggles only the focused chip', async () => {
  render(<Multi />)
  expect(screen.getByRole('group', { name: 'Pick any' })).toBeInTheDocument()
  screen.getByRole('checkbox', { name: 'Beta' }).focus()
  await userEvent.keyboard(' ')
  expect(screen.getByRole('checkbox', { name: 'Beta' })).toBeChecked()
  expect(screen.getByRole('checkbox', { name: 'Alpha' })).toBeChecked()
  expect(screen.getByRole('checkbox', { name: 'Gamma' })).not.toBeChecked()

  await userEvent.keyboard(' ')
  expect(screen.getByRole('checkbox', { name: 'Beta' })).not.toBeChecked()
  expect(screen.getByRole('checkbox', { name: 'Alpha' })).toBeChecked()
})

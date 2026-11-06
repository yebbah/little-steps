// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { TextField } from './TextField.tsx'

test('the visible label names the field and typing works', async () => {
  render(<TextField label="Note" />)
  const field = screen.getByLabelText('Note')
  await userEvent.type(field, 'hello')
  expect(field).toHaveValue('hello')
  expect(field).not.toHaveAttribute('autocomplete')
  expect(field).not.toHaveAttribute('inputmode')
  expect(field).not.toHaveAttribute('aria-invalid')
})

test('an error shows as text with aria-invalid and aria-describedby', () => {
  render(<TextField label="Note" error="Add a few words" />)
  const field = screen.getByLabelText('Note')
  expect(field).toHaveAttribute('aria-invalid', 'true')
  const message = screen.getByText('Add a few words')
  expect(field).toHaveAttribute('aria-describedby', message.id)
})

test('a caller aria-describedby is kept next to the error', () => {
  render(<TextField label="Note" aria-describedby="hint" error="Add a few words" />)
  const ids = screen.getByLabelText('Note').getAttribute('aria-describedby')?.split(' ')
  expect(ids?.[0]).toBe('hint')
  expect(ids).toHaveLength(2)
})

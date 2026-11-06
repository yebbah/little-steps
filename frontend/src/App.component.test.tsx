// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from './App.tsx'

// Sample component test: renders in jsdom and asserts by role, the way users and assistive tech find things.
test('the shell has one main landmark and the product name as its h1', () => {
  render(<App />)

  expect(screen.getByRole('main')).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 1, name: 'LittleSteps' })).toBeInTheDocument()
})

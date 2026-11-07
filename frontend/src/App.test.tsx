// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from './App.tsx'
import { NAV_ICON_NAMES } from './icons/names.ts'
import { t } from './i18n/messages.ts'

test('the app mounts the shell: one main landmark and the Today h1 after the redirect from /', () => {
  render(<App />)
  expect(screen.getByRole('main')).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument()
})

test('every nav destination has its label, subject and intro in the catalog', () => {
  for (const name of NAV_ICON_NAMES) {
    for (const key of [`nav.${name}`, `screen.${name}.subject`, `screen.${name}.intro`]) {
      expect(t(key), key).not.toBe(key)
    }
  }
})

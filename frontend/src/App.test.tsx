import { renderToString } from 'react-dom/server'
import { expect, test } from 'vitest'
import App from './App.tsx'

test('the app shell renders the product name', () => {
  expect(renderToString(<App />)).toContain('LittleSteps')
})

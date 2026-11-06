import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Vitest: unit tests live next to the code. The coverage report is uploaded by CI.
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: { provider: 'v8', include: ['src/**'], reporter: ['text', 'lcov', 'json-summary'] },
  },
  server: {
    // Day-to-day development: run the backend from the IDE (port 8080) and `npm run dev`.
    proxy: {
      '/api': 'http://localhost:8080',
      '/actuator': 'http://localhost:8080',
    },
  },
})

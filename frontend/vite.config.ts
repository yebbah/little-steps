import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // The component gallery exists only in local and test builds (Story 2.1). The flag comes from
  // .env.development and .env.test; a production build ignores it, whatever the environment says.
  define: mode !== 'development' && mode !== 'test' ? { 'import.meta.env.VITE_ENABLE_GALLERY': JSON.stringify('false') } : {},
  test: {
    // Vitest: unit tests live next to the code. The coverage report is uploaded by CI.
    include: ['src/**/*.test.{ts,tsx}'],
    // The gallery reads tokens.css as text (?raw); Vitest would otherwise stub every CSS file as empty.
    css: { include: [/tokens\.css/] },
    // jest-dom matchers and cleanup for component tests. Files opt into jsdom with `// @vitest-environment jsdom`.
    setupFiles: ['./src/test/setup.ts'],
    // The JUnit file feeds the epic release note (deploy/release-notes.sh).
    reporters: ['default', 'junit'],
    outputFile: { junit: 'test-results/junit.xml' },
    coverage: { provider: 'v8', include: ['src/**'], reporter: ['text', 'lcov', 'json-summary'] },
  },
  server: {
    // Day-to-day development: run the backend from the IDE (port 8080) and `npm run dev`.
    proxy: {
      '/api': 'http://localhost:8080',
      '/actuator': 'http://localhost:8080',
    },
  },
}))

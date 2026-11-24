import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import { queryClient, startDataLayer } from './data/index.ts'
import { createAppRouter } from './shell/routes.tsx'

// One router for the page. Creating it in render would build a second one under StrictMode, and each
// browser router keeps its own history listener.
let router: ReturnType<typeof createAppRouter> | undefined

function App() {
  router ??= createAppRouter()
  // Reads the session, checks who owns the stored data, and replays the outbox.
  useEffect(() => startDataLayer(), [])
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

export default App

import { RouterProvider } from 'react-router'
import { createAppRouter } from './shell/routes.tsx'

// One router for the page. Creating it in render would build a second one under StrictMode, and each
// browser router keeps its own history listener.
let router: ReturnType<typeof createAppRouter> | undefined

function App() {
  router ??= createAppRouter()
  return <RouterProvider router={router} />
}

export default App
